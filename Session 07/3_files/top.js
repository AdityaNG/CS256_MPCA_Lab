// **************************************************************************************

function Operator(name,execution_cycles,functional_unit,display_value){
	this.name = name;
	this.execution_cycles = execution_cycles;
	this.functional_unit = functional_unit;
	this.display_value = display_value;
}

// **************************************************************************************

function Instruction(name,source_register1,source_register2,destination_register,operator){
	this.name = name;
	this.source_register1 = source_register1;
	this.source_register2 = source_register2;
	this.destination_register = destination_register;
	this.operator = operator;
	this.issue_cycle = null;
	this.pipeline_stage = null;
	this.execute_counter = 0;
}

// **************************************************************************************

function Change_Execution_Time(operator, new_value){
	// The "- 0" is needed to force converstion of the value to an integer.
	operator.execution_cycles = new_value - 0;
	UpdateDisplay();
}

// **************************************************************************************

function Change_Add_Instruction(){
	var selected_value = document.insert_instruction_table.operator.options[document.insert_instruction_table.operator.selectedIndex].value;
	if (selected_value == "fp_ld"){
		LoadOffsetField(document.insert_instruction_table.source_register1);
		LoadIntegerRegisters(document.insert_instruction_table.source_register2);
		LoadFPRegisters(document.insert_instruction_table.destination_register);

	}
	else if (selected_value == "fp_sd"){
		LoadOffsetField(document.insert_instruction_table.source_register1);
		LoadIntegerRegisters(document.insert_instruction_table.source_register2);
		LoadFPRegisters(document.insert_instruction_table.destination_register);
	}
	else if (selected_value.substring(0,2) == "fp"){
		LoadFPRegisters(document.insert_instruction_table.source_register1);
		LoadFPRegisters(document.insert_instruction_table.source_register2);
		LoadFPRegisters(document.insert_instruction_table.destination_register);
	}
	else if (selected_value == "int_ld"){
		LoadOffsetField(document.insert_instruction_table.source_register1);
		LoadIntegerRegisters(document.insert_instruction_table.source_register2);
		LoadIntegerRegisters(document.insert_instruction_table.destination_register);
	}
	else if(selected_value == "int_sd"){
		LoadOffsetField(document.insert_instruction_table.source_register1);
		LoadIntegerRegisters(document.insert_instruction_table.source_register2);
		LoadFPRegisters(document.insert_instruction_table.destination_register);
	}
	else if (selected_value.substring(0,3) == "int"){
		LoadIntegerRegisters(document.insert_instruction_table.source_register1);
		LoadIntegerRegisters(document.insert_instruction_table.source_register2);
		LoadIntegerRegisters(document.insert_instruction_table.destination_register);
	}
	else if (selected_value.substring(0,2) == "br"){
		LoadOffset(document.insert_instruction_table.source_register1);
		LoadIntegerRegisters(document.insert_instruction_table.source_register2);
		ClearRegisters(document.insert_instruction_table.destination_register);
	}
}

// **************************************************************************************

function Page_Load_Complete(){
	LoadFPRegisters(document.insert_instruction_table.source_register1);
	LoadFPRegisters(document.insert_instruction_table.source_register2);
	LoadFPRegisters(document.insert_instruction_table.destination_register);

	LoadExecutionTime(document.execution_time_table.fp_add_sub_new);
	LoadExecutionTime(document.execution_time_table.fp_mult_new);
	LoadExecutionTime(document.execution_time_table.fp_div_new);
	LoadExecutionTime(document.execution_time_table.int_div_new);
	
}

// **************************************************************************************

function Instruction_Insert(){
	var op = document.insert_instruction_table.operator.options[document.insert_instruction_table.operator.selectedIndex].value;
	var src_reg1 = document.insert_instruction_table.source_register1.options[document.insert_instruction_table.source_register1.selectedIndex].value;
	var src_reg2 = document.insert_instruction_table.source_register2.options[document.insert_instruction_table.source_register2.selectedIndex].value;
	var dest_reg = document.insert_instruction_table.destination_register.options[document.insert_instruction_table.destination_register.selectedIndex].value;

/*
	instruction_array[total_instructions] = new Instruction();
	instruction_array[total_instructions].source_register1 = src_reg1;
	instruction_array[total_instructions].source_register2 = src_reg2;
	instruction_array[total_instructions].destination_register = dest_reg;
	instruction_array[total_instructions].operator = eval(op);
*/
	
	if (op == "fp_sd" || op == "int_sd"){
		instruction_array[total_instructions] = new Instruction("",dest_reg,src_reg2,"null",eval(op));
	}
	else {
		instruction_array[total_instructions] = new Instruction("",src_reg1,src_reg2,dest_reg,eval(op));
	}

	total_instructions++;
	UpdateDisplay();

	document.insert_instruction_table.destination_register.selectedIndex = 0;
	document.insert_instruction_table.source_register1.selectedIndex = 0;
	document.insert_instruction_table.source_register2.selectedIndex = 0;
}

// **************************************************************************************

function UpdateDisplay(){
	if (total_instructions > 0){
		// Reset all of the pipeline variables.	
		for (i = 0 ; i < total_instructions ; i++){
			instruction_array[i].issue_cycle = null;
			instruction_array[i].pipeline_stage = null;
			instruction_array[i].execute_counter = 0;
		}
		// Reload the bottom frame.
		parent.bottom_frame.location.href='bottom.html';
	}
	else {
		parent.bottom_frame.location.href="about:blank";
	}
}

// **************************************************************************************

function RemoveLastInstruction(){

	total_instructions--;
	if (total_instructions < 0){
		total_instructions = 0;
	}
	UpdateDisplay();
}

// **************************************************************************************

function LoadExecutionTime(instruction_pointer){
	var num_of_options = 20;

	instruction_pointer.length = num_of_options;

	for (x = 0 ; x < num_of_options ; x++){
		instruction_pointer.options[x].value = x+1;
		instruction_pointer.options[x].text = x+1;
	}
}

// **************************************************************************************

function LoadIntegerRegisters(register_pointer){
	var num_of_registers = 32;

	register_pointer.length = num_of_registers;

	for (x = 0 ; x < num_of_registers ; x++){
		register_pointer.options[x].text = "R" + (x+1);
		register_pointer.options[x].value = "R" + (x+1);
	}
}

// **************************************************************************************

function LoadFPRegisters(register_pointer){
	var num_of_registers = 16;

	register_pointer.length = num_of_registers;

	for (x = 0 ; x < num_of_registers ; x++){
		register_pointer.options[x].text = "F" + (x+1);
		register_pointer.options[x].value = "F" + (x+1);
	}
}

// **************************************************************************************

function LoadOffset(register_pointer){
	register_pointer.length = 1;
	register_pointer.options[0].text = "Offset";
	register_pointer.options[0].value = "Offset";
}

// **************************************************************************************

function LoadOffsetField(register_pointer){
	register_pointer.length = 1;
	register_pointer.options[0].text = "Offset";
	register_pointer.options[0].value = "Offset";
}

// **************************************************************************************

function ClearRegisters(register_pointer){
	register_pointer.length = 1;
	register_pointer.options[0].text = " ";
	register_pointer.options[0].value = "null";
}

// **************************************************************************************

function OpenHelp(){
	if ((parent.help_window == null) || (parent.help_window.closed)){
		parent.help_window = window.open('help.html','help_window','width=400,height=500,toolbar=0,scrollbars=1');
	}
	else {
		parent.help_window.focus();
	}
}

// **************************************************************************************

function CloseHelp(){
	if ((parent.help_window != null) && (!parent.help_window.closed)){
		parent.help_window.close();
	}
	parent.help_window = null; 
}

// **************************************************************************************


// *** Main Section ***

var instruction_array_size = 50;
var total_instructions = 0;

// Create all of the operators.
var fp_mult = new Operator("fp_mult",1,"fp_mult_unit","* (f)");
var fp_add = new Operator("fp_add",1,"fp_add_sub_unit","+|- (f)");
var fp_sub = new Operator("fp_sub",1,"fp_add_sub_unit","+|- (f)");
var fp_div = new Operator("fp_div",1,"fp_div_unit","/ (p)");
var fp_ld = new Operator("fp_ld",1,"int_unit","EX");
var fp_sd = new Operator("fp_sd",1,"int_unit","EX");
var int_mult = new Operator("int_mult",1,"int_mult_unit","* (i)");
var int_add  = new Operator("int_add",1,"int_unit","+|- (i)");
var int_sub  = new Operator("int_sub",1,"int_unit","+|- (i)");
var int_div  = new Operator("int_div",1,"int_div_unit","/ (i)");
var int_ld  = new Operator("int_ld",1,"int_unit","EX");
var int_sd  = new Operator("int_sd",1,"int_unit","EX");
var br_taken = new Operator("br_taken",1,"br_add"," ");
var br_untaken = new Operator("br_untaken",1,"br_add"," ");

// Create the instruction array.
var instruction_array = new Instruction(instruction_array_size);

// **************************************************************************************
