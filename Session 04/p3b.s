; Add corresponding elements of arrays
.TEXT
LDR R0, =A
LDR R1, =B
LDR R2, =C
MOV R3, #5
MOV R7, #0

LOOP:
        LDR R4, [R0]
        LDR R5, [R1]
        MLA R7, R4, R5, R7

        ADD R0, R0, #4
        ADD R1, R1, #4
        ADD R2, R2, #4
        
        SUBS R3, R3, #1
        BNE LOOP        

STR R7, [R2]

SWI 0X11

.DATA
A: .word 10, 20, 30, 40, 50
B: .word 10, 20, 30, 40, 50
C: .word 0
