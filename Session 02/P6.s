; Coded by VRG

.TEXT
LDR R0, =A
MOV R3, #5
LOOP:
LDR R1, [R0]
ADD R2, R2, R1
ADD R0, R0, #4
SUBS R3, R3, #1
BNE LOOP
SWI 0X011

.DATA
A: .WORD 0X01, 0X02, 0X03, 0X04, 0X05
B: .WORD 0X00
