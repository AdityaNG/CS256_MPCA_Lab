MOV R0, #01
MOV R1, #02
MOV R2, #03
MOV R3, #04
MOV R4, #05
ADD R5, R0, R1
ADD R5, R2, R5
ADD R5, R3, R5
ADD R5, R4, R5
SWI 0X011