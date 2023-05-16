#ifndef TAP_H
#define TAP_H

// TAP.h - TAP (Test Anything Protocol) output for UnitTestRunner


void TAP_version(unsigned int version);
void TAP_indent();
void TAP_start_subtest(const char *subtestName);
void TAP_end_subtest(unsigned int testNumber, const char *subtestName, char subtestResult);
void TAP_plan(unsigned int testCount);
void TAP_comment(const char *comment);
void TAP_ok(unsigned int testNumber, const char *description);
void TAP_not_ok(unsigned int testNumber, const char *description);
void TAP_YAMLDiagnostic(const char *file, unsigned int line,const char *message);
void TAP_skip(unsigned int testNumber, const char *comment);
void TAP_todo(unsigned int testNumber, const char *comment);
void TAP_bail_out(const char *message);

#endif // TAP_H