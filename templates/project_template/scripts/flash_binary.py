from pyocd.core.helpers import ConnectHelper
from pyocd.flash.file_programmer import FileProgrammer

import sys
import logging
logging.basicConfig(level=logging.INFO)

with ConnectHelper.session_with_chosen_probe() as session:

    board = session.board
    target = board.target
    flash = target.memory_map.get_boot_memory()

    programmer = FileProgrammer(session)
    programmer.program(sys.argv[1], base_address=flash.start)

    # Reset the target to run the program.
    target.reset()