; Add corresponding elements of arrays
.TEXT
LDR R0, =A

LDR R1, [R0], #20 ; 5TH ELEMENT
LDR R2, [R0], #32 ; 8TH ELEMENT
LDR R3, [R0], #4  ; 1ST ELEMENT


SWI 0X11

.DATA

A: .word 1, 2, 3, 4, 2, 3, 1, 2, 1
