
import argparse
from typing import List, Sequence
from pyocd.core.helpers import ConnectHelper
from pyocd.flash.file_programmer import FileProgrammer
from pyocd.core.memory_map import MemoryMap, MemoryRegion, MemoryType
from pyocd.core.soc_target import SoCTarget
from pyocd.subcommands.base import SubcommandBase
from pyocd.utility.cmdline import convert_session_options, int_base_0
from pyocd.utility.kbhit import KBHit
from ctypes import Structure, c_char, c_int32, c_uint32, sizeof
from pyocd.core.target import Target
from elfwrapper.elf_wrapper import ElfAddrObj

import sys
import logging

class SEGGER_RTT_BUFFER_UP(Structure):
    """@brief `SEGGER RTT Ring Buffer` target to host."""

    _fields_ = [
        ("sName", c_uint32),
        ("pBuffer", c_uint32),
        ("SizeOfBuffer", c_uint32),
        ("WrOff", c_uint32),
        ("RdOff", c_uint32),
        ("Flags", c_uint32),
    ]


class SEGGER_RTT_BUFFER_DOWN(Structure):
    """@brief `SEGGER RTT Ring Buffer` host to target."""

    _fields_ = [
        ("sName", c_uint32),
        ("pBuffer", c_uint32),
        ("SizeOfBuffer", c_uint32),
        ("WrOff", c_uint32),
        ("RdOff", c_uint32),
        ("Flags", c_uint32),
    ]


class SEGGER_RTT_CB(Structure):
    """@brief `SEGGER RTT control block` structure. """

    _fields_ = [
        ("acID", c_char * 16),
        ("MaxNumUpBuffers", c_int32),
        ("MaxNumDownBuffers", c_int32),
        ("aUp", SEGGER_RTT_BUFFER_UP * 3),
        ("aDown", SEGGER_RTT_BUFFER_DOWN * 3),
    ]

def main():

    LOG = logging.getLogger(__name__)
    logging.basicConfig(level=logging.CRITICAL)

    with ConnectHelper.session_with_chosen_probe() as session:

        session.options.set("hide_programming_progress", True)

        board = session.board
        target : SoCTarget = board.target
        flash = target.memory_map.get_boot_memory()

        # Halt the target.
        target.halt()

        # Fill RAM with 0x00.
        memory_map: MemoryMap = target.get_memory_map()
        for region in memory_map.iter_matching_regions():
            if region.type == MemoryType.RAM:
                target.write_memory_block8(region.start, bytearray(region.length))
        
        # Program the test binary.
        programmer = FileProgrammer(session)
        programmer.program(sys.argv[1], base_address=flash.start)

        # Reset the target.
        target.reset()

        # Find the RTT control block.
        memory_map: MemoryMap = target.get_memory_map()
        ram_region: MemoryRegion = memory_map.get_default_region_of_type(MemoryType.RAM)

        rtt_range_start = ram_region.start
        rtt_range_size = ram_region.length
        LOG.info(f"RTT control block search range [{rtt_range_start:#08x}, {rtt_range_size:#08x}]")

        rtt_cb_addr = -1
        data = bytearray(b'0000000000')
        chunk_size = 1024
        while rtt_range_size > 0:
            read_size = min(chunk_size, rtt_range_size)
            data += bytearray(target.read_memory_block8(rtt_range_start, read_size))
            pos = data[-(read_size + 10):].find(b"SEGGER RTT")
            if pos != -1:
                rtt_cb_addr = rtt_range_start + pos - 10
                break
            rtt_range_start += read_size
            rtt_range_size -= read_size
        if rtt_cb_addr == -1:
            LOG.error("No RTT control block available")
            return 1
        data = target.read_memory_block8(rtt_cb_addr, sizeof(SEGGER_RTT_CB))
        rtt_cb = SEGGER_RTT_CB.from_buffer(bytearray(data))
        up_addr = rtt_cb_addr + SEGGER_RTT_CB.aUp.offset
        down_addr = up_addr + sizeof(SEGGER_RTT_BUFFER_UP) * rtt_cb.MaxNumUpBuffers
        LOG.info(f"_SEGGER_RTT @ {rtt_cb_addr:#08x} with {rtt_cb.MaxNumUpBuffers} aUp and {rtt_cb.MaxNumDownBuffers} aDown")

        test_result : Sequence[int] = []
        end_word : str = "STOP.\n"
        end_word_bytes : Sequence[int] = [ord(c) for c in end_word]

        while test_result[-6:] != end_word_bytes:
            # read data from up buffers (target -> host)    
            data = target.read_memory_block8(up_addr, sizeof(SEGGER_RTT_BUFFER_UP))
            up = SEGGER_RTT_BUFFER_UP.from_buffer(bytearray(data))
            data = []
            if up.WrOff > up.RdOff:
                """
                |oooooo|xxxxxxxxxxxx|oooooo|
                0    rdOff        WrOff    SizeOfBuffer
                """
                data = target.read_memory_block8(up.pBuffer + up.RdOff, up.WrOff - up.RdOff)
                target.write_memory(up_addr + SEGGER_RTT_BUFFER_UP.RdOff.offset, up.WrOff)
                for d in data:
                    test_result.append(d)
            elif up.WrOff < up.RdOff:
                """
                |xxxxxx|oooooooooooo|xxxxxx|
                0    WrOff        RdOff    SizeOfBuffer
                """
                data = target.read_memory_block8(up.pBuffer + up.RdOff, up.SizeOfBuffer - up.RdOff)
                data += target.read_memory_block8(up.pBuffer, up.WrOff)
                target.write_memory(up_addr + SEGGER_RTT_BUFFER_UP.RdOff.offset, up.WrOff)
                for d in data:
                    test_result.append(d)
            else:
                pass
            
        print(bytes(test_result).decode(), end="", flush=True)

        session.close()


if __name__ == '__main__':
    main()