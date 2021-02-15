; Add corresponding elements of arrays
.TEXT
LDR R0, =A


MOV R3, #3

LOOP_1:
	LOOP_2:
		MOV R4, #3

		MLA R5, R3, #3, R4
	        LDR R6, [R0], R5
       		ADD R7, R7, R6

        
		SUBS R4, R4, #1
		BNE LOOP
	SUBS R3, R3, #1
        BNE LOOP_1

SWI 0X11

.DATA

A: .word 1, 2, 3, 4, 2, 3, 1, 2, 1  


