; Add corresponding elements of arrays
.TEXT
LDR R0, =A
LDR R1, =B
LDR R2, =C
MOV R3, #9

LOOP:
        LDR R4, [R0]
        LDR R5, [R1]
        ADD R6, R4, R5
        STR R6, [R2]

        ADD R0, R0, #4
        ADD R1, R1, #4
        ADD R2, R2, #4
        
        SUBS R3, R3, #1
        BNE LOOP        

SWI 0X11

.DATA

A: .word 1, 2, 3, 4, 2, 3, 1, 2, 1  
B: .word 1, 1, 1, 2, 2, 2, 3, 3, 3 
C: .word 0, 0, 0, 0, 0
