// **************************************************************************************

function Step_To_End(){
	for (i = 0 ; i < number_of_columns ; i++){
		Step();
	}
}

// **************************************************************************************

function Display_Stall(){
	s = "document.instruction_table.column" + current_cycle + "[" + x + "].value = 'S'; document.instruction_table.column" + current_cycle + "[" + x + "].className='stall_red';";
	eval(s);
}

// **************************************************************************************

function Step(){
	// Do not do anything if we have already gone through all of the cycles.
	if (number_of_columns == current_cycle){
		return;
	}
	if (number_of_rows != 1){
	// ****** Multiple instructions in the array ******

		stall = 0;
		x = 0;

		while (x < number_of_rows){
			// Break out of the loop when we get to an instruction which hasn't been entered into the pipeline yet.
			if (parent.top_frame.instruction_array[x].issue_cycle == null){
				break;
			}
			// If the stall variable is set, then we should stall and not do any work.
			if (stall == 1){
				Display_Stall();
			}
			else {
				// Find what stage the current instruciton is in and do work accordingly.
				switch(parent.top_frame.instruction_array[x].pipeline_stage){
					

					case "IF" :
						// Set the new stage to ID
						parent.top_frame.instruction_array[x].pipeline_stage = "ID";
						break;


					case "ID" :
						// Check if this instruction can be executed by comparing it against all previous instructions.
						for (i = (x - 1); i >= 0 ; i--){

							// If a previous instruction is in the EX stage and both instructions use the same functional unit.
							if (parent.top_frame.instruction_array[i].pipeline_stage == "EX" && parent.top_frame.instruction_array[i].operator.functional_unit == parent.top_frame.instruction_array[x].operator.functional_unit){
								// *** Structural Hazard ***
								stall = 1;
								break;
							}

							// If the destination register of a previous instruciton is the same and one of the source 
							// registers of the current instruction.
							else if ((parent.top_frame.instruction_array[i].destination_register == parent.top_frame.instruction_array[x].source_register1 || parent.top_frame.instruction_array[i].destination_register == parent.top_frame.instruction_array[x].source_register2)){
								// We must check if data forwarding is enabled and handle that situation differently.
								if (data_forwarding == 1){
									// If forwarding is enabled and the previous instruction is a store or load
									// and is not in the WB stage or further in the pipeline, stall.
									if (parent.top_frame.instruction_array[i].operator.name == "fp_ld" || parent.top_frame.instruction_array[i].operator.name == "fp_sd"){
										if (parent.top_frame.instruction_array[i].pipeline_stage != "WB" && parent.top_frame.instruction_array[i].pipeline_stage != " "){
											// ** RAW Hazard **
											stall = 1;
											break;
										}
									}
									// If forwarding is enabled and the previous instruction is not a store or load
									// and is not in the MEM stage or further in the pipeline, stall.
									else {
										if (parent.top_frame.instruction_array[i].pipeline_stage != "MEM" && parent.top_frame.instruction_array[i].pipeline_stage != "WB" && parent.top_frame.instruction_array[i].pipeline_stage != " "){
											// *** RAW Hazard **
											stall = 1;
											break;
										}
									}
								}

								else if (data_forwarding == 0){
									// If forwarding is disabled and the previous instruction is not completed, stall.
									if (parent.top_frame.instruction_array[i].pipeline_stage != " "){
											// *** RAW Hazard **
											stall = 1;
											break;
									}
								}
							}

							// If the destination registers are the same for both instructions and the destination registers
							// are not equal to "null."  The destination register will only equal "null" for BR and SD 
							// instructions.
							else if ((parent.top_frame.instruction_array[i].destination_register == parent.top_frame.instruction_array[x].destination_register) && (parent.top_frame.instruction_array[i].destination_register != "null")){

								// If a previous instruction is in the EX stage and the remaining cycles for that
								// previous instruction is greater than or equal to the current instruction's 
								// execution cycles minus one.  (The minus one is there because the previous instructions
								// will have already been moved into their "next" stage while the current instruciton 
								// hasn't been executed yet.)
								if ((parent.top_frame.instruction_array[i].pipeline_stage == "EX") && ((parent.top_frame.instruction_array[i].operator.execution_cycles - parent.top_frame.instruction_array[i].execute_counter) >= (parent.top_frame.instruction_array[x].operator.execution_cycles - 1))){
									// *** WAW Hazard ***
									stall = 1;
									break;
								}

							}

							// If a previous instruction is in the EX stage and the remaining cycles for that
							// previous instruction is equal to the current instruction's execution cycles minus one.
							// (The minus one is there because the previous instructions will have already been moved into
							// their "next" stage while the current instruciton hasn't been executed yet.)
							else if ((parent.top_frame.instruction_array[i].pipeline_stage == "EX") && ((parent.top_frame.instruction_array[i].operator.execution_cycles - parent.top_frame.instruction_array[i].execute_counter) == (parent.top_frame.instruction_array[x].operator.execution_cycles - 1))){
								
								// *** WB will happen at the same time ***
								stall = 1;
								break;
							}
						} 	

						// If no stalls have been detected.
						if (stall != 1){
							// If branch is taken, cancel following instruction and complete the execution of the branch.
							if (parent.top_frame.instruction_array[x].operator.name == "br_taken"){
								parent.top_frame.instruction_array[x].pipeline_stage = " ";
								parent.top_frame.instruction_array[x].execute_counter++;
								if ((x+1) < number_of_rows){
									parent.top_frame.instruction_array[x+1].pipeline_stage = " ";
								}
								
							}
							// Complete the execution of the branch.
							else if (parent.top_frame.instruction_array[x].operator.name == "br_untaken"){
								parent.top_frame.instruction_array[x].pipeline_stage = " ";
								parent.top_frame.instruction_array[x].execute_counter++;
							}
							// Move the instruction into the EX stage.
							else {
								parent.top_frame.instruction_array[x].pipeline_stage = "EX";
								parent.top_frame.instruction_array[x].execute_counter++;
							}
						}

						break;


					case "EX" :
						// If we have completed execution of the current instruction.
						if (parent.top_frame.instruction_array[x].execute_counter < parent.top_frame.instruction_array[x].operator.execution_cycles){
							parent.top_frame.instruction_array[x].pipeline_stage = "EX";
							parent.top_frame.instruction_array[x].execute_counter++;
						}
						// Move the instruction on to the next stage. 
						else{
							parent.top_frame.instruction_array[x].pipeline_stage = "MEM";
						}
						break;


					case "MEM" :
						parent.top_frame.instruction_array[x].pipeline_stage = "WB";
						break;


					case "WB" :
						// Complete the execution of this instruction.
						parent.top_frame.instruction_array[x].pipeline_stage = " ";
						break;


					case " " :
						// Instructions that have completed, stay completed.
						parent.top_frame.instruction_array[x].pipeline_stage = " ";
						break;


					default :
						// Handle the unlikely error that the instruction is in an undefined pipeline stage.
						alert("Unrecognized Pipeline Stage!");
						return;
				}

				// If a stall occured, set the output to "s".
				if (stall == 1){
					Display_Stall();
				}
				// If an instruction is in the EX stage, output the functional unit.
				else if (parent.top_frame.instruction_array[x].pipeline_stage == "EX"){
					s = "document.instruction_table.column" + current_cycle + "[" + x + "].value = parent.top_frame.instruction_array[x].operator.display_value;";
				}
				// Output the pipeline stage.
				else {
					s = "document.instruction_table.column" + current_cycle + "[" + x + "].value = parent.top_frame.instruction_array[x].pipeline_stage;";
				}
				// Display the value on the screen.
				eval(s);
			}
			x++;
		} // End of while loop

		// If we didn't encounter a stall in one of the previous instructions, and if not all of the instructions are in the pipeline.
		if (stall != 1 && x < number_of_rows){
			// Issue a new instruction.
			parent.top_frame.instruction_array[x].issue_cycle = current_cycle;
			parent.top_frame.instruction_array[x].pipeline_stage = "IF";
			s = "document.instruction_table.column" + current_cycle + "[" + x + "].value = parent.top_frame.instruction_array[x].pipeline_stage;";
			eval(s);
		}

		// Increment the cycle count.
		current_cycle++;
	}
	else {

		// ******  Only one instruction in the array ******
	
		// Since there is only one instruction, no stalls can occur.
		
		// If the current cycle is 0, we have to issue the only instruction.
		if (current_cycle == 0){
			parent.top_frame.instruction_array[0].issue_cycle = current_cycle;
			parent.top_frame.instruction_array[0].pipeline_stage = "IF";
			s = "document.instruction_table.column" + current_cycle + ".value = parent.top_frame.instruction_array[0].pipeline_stage;";
			eval(s);
			current_cycle++;
		}
		else{
			switch(parent.top_frame.instruction_array[0].pipeline_stage){
				case "IF" :
					parent.top_frame.instruction_array[0].pipeline_stage = "ID";
					break;

				case "ID" :

					// If branch is taken, complete this instruction.
					if (parent.top_frame.instruction_array[0].operator.name.substring(0,2) == "br"){
						parent.top_frame.instruction_array[0].pipeline_stage = " ";
						parent.top_frame.instruction_array[0].execute_counter++;
					}	
					// Move the instruction into the EX stage.	
					else {
						parent.top_frame.instruction_array[0].pipeline_stage = "EX";
						parent.top_frame.instruction_array[0].execute_counter++;
					}
					
					break;

				case "EX" :
					// If the instruction hasn't completed.
					if (parent.top_frame.instruction_array[0].execute_counter < parent.top_frame.instruction_array[0].operator.execution_cycles){
						parent.top_frame.instruction_array[0].pipeline_stage = "EX";
						parent.top_frame.instruction_array[0].execute_counter++;
					}
					// Move the instruction to the MEM stage.
					else{
						parent.top_frame.instruction_array[0].pipeline_stage = "MEM";
					}
					break;

				case "MEM" :
					parent.top_frame.instruction_array[0].pipeline_stage = "WB";
					break;

				case "WB" :
					parent.top_frame.instruction_array[0].pipeline_stage = " ";
					break;

				case " " :
					parent.top_frame.instruction_array[0].pipeline_stage = " ";
					break;

				default :
					alert("Unrecognized Pipeline Stage!");
			}
			
			// If the instruction is in the EX stage, display the functional unit.
			if (parent.top_frame.instruction_array[0].pipeline_stage == "EX"){
				s = "document.instruction_table.column" + current_cycle + ".value = parent.top_frame.instruction_array[0].operator.display_value;";
			}
			else {
				s = "document.instruction_table.column" + current_cycle + ".value = parent.top_frame.instruction_array[0].pipeline_stage;";
			}
			eval(s);
			current_cycle++;
		}
	}
}

// **************************************************************************************

function abs(input){
	if (input < 0){
		input = input * (-1);
	}
	return input;
}

// **************************************************************************************

function Add_Dependency(input){
	document.dependency_form.display.value = document.dependency_form.display.value + input + "\n";
} 

// **************************************************************************************

function Check_Depencency(){
	// Reset the dependency list.
	document.dependency_form.display.value="";

	// Create a dependency variable
	var dep_exists = 0;

	// i is the current instruction.
	for (i = 0 ; i < number_of_rows ; i++){
		// j is one of the previous instructions.
		for (j = 0 ; j < i ; j++){
			
			dep_exists = 0;

			// *** Test for RAW ***
			// If the destination register for a previous instruction has the same value as one of the current instructions source registers.
			if ((parent.top_frame.instruction_array[j].destination_register == parent.top_frame.instruction_array[i].source_register1) || (parent.top_frame.instruction_array[j].destination_register == parent.top_frame.instruction_array[i].source_register2)){
				// A load instruction will take one cycle longer than any other instruction when forwarding is enabled.
				if ((parent.top_frame.instruction_array[j].operator.name == "fp_ld" || parent.top_frame.instruction_array[j].operator.name == "int_ld") && (data_forwarding == 1)){
					// If the difference between when the instructions would be issued is greater than the number of execution cycles 
					// for the earlier instruction, we have a hazard.
					// non_forward_delay should be zero.  Add one for the additional cycle before data will be ready. (After MEM Stage)
					if ((i - j) < parent.top_frame.instruction_array[j].operator.execution_cycles + non_forward_delay + 1){
						dep_exists = 1;
						Add_Dependency(("RAW: Instructions " + j + " and " + i + ".  Register " + parent.top_frame.instruction_array[j].destination_register + "."));
					}
				}
				else {
					// If the difference between when the instructions would be issued is greater than the number of execution cycles 
					// for the earlier instruction, we have a hazard.
					if ((i - j) < parent.top_frame.instruction_array[j].operator.execution_cycles + non_forward_delay){
						dep_exists = 1
						Add_Dependency(("RAW: Instructions " + j + " and " + i + ".  Register " + parent.top_frame.instruction_array[j].destination_register + "."));
					}
				}
			}


			// *** Test for WAR ***
			// If the destination register for the current instruction has the same value as one of the previous instructions source registers
			// and the difference between the instructions is greater than the difference between the execution cycles of the two instructions.
			if (((parent.top_frame.instruction_array[j].source_register1 == parent.top_frame.instruction_array[i].destination_register) || (parent.top_frame.instruction_array[j].source_register2 == parent.top_frame.instruction_array[i].destination_register)) && (i - j) < abs(parent.top_frame.instruction_array[j].operator.execution_cycles - parent.top_frame.instruction_array[i].operator.execution_cycles)){
				Add_Dependency(("WAR: Instructions " + j + " and " + i + ".  Register " + parent.top_frame.instruction_array[i].destination_register + "."));
			}


			// *** Test for WAW ***
			// If the destination register for the current instruciton is the same as the destination register of a previous instruction
			// and the difference between the instructions is greater than or equal to the difference between the execution cycles
			// of the two instrucitons.
			// The destination register field will be "null" when the operator doesn't support a destination register. (BR and SD)
			if ((parent.top_frame.instruction_array[i].destination_register == parent.top_frame.instruction_array[j].destination_register) && ((i - j) <= abs(parent.top_frame.instruction_array[j].operator.execution_cycles - parent.top_frame.instruction_array[i].operator.execution_cycles))){
				if (parent.top_frame.instruction_array[j].destination_register != "null"){
					Add_Dependency(("WAW: Instructions " + j + " and " + i + ".  Register " + parent.top_frame.instruction_array[j].destination_register + "."));
				}
			}


			// *** Test for Structural Hazard ***
			// If two instructions use the same functional unit and the difference between the two instructions is less than the 
			// execution cycles of the earlier instruction.
			if ((parent.top_frame.instruction_array[i].operator.functional_unit == parent.top_frame.instruction_array[j].operator.functional_unit) &&  ((i - j) < parent.top_frame.instruction_array[j].operator.execution_cycles)){ 
				Add_Dependency("Structural: Instructions " + j + " and " + i + ".  Unit: " + parent.top_frame.instruction_array[j].operator.display_value);		
			}

			// *** Test for simultaneous MEM/WB ***
			if ((dep_exists == 0) && ((i - j) == (parent.top_frame.instruction_array[j].operator.execution_cycles - parent.top_frame.instruction_array[i].operator.execution_cycles))){
				Add_Dependency("Instructions " + j + " and " + i + " will enter the MEM and WB stage at the same time.");	
			}
		}
	} // End of outer for loop.

	// If no dependencies were found, output a message.
	if (document.dependency_form.display.value == ""){
		document.dependency_form.display.value = "No Hazards Found.";
	}
}

// **************************************************************************************

function BuildPipeline(){

	// *** Create the table to display the pipeline ***
	document.write("<p><form name='instruction_table'><table border='1'><tr><td colspan='2'></td><td align='center' colspan='" + number_of_columns + "'><b>CPU Cycles</b></td></tr><tr><td colspan='2' align='center'><b>Instruction<b></td>");

	// Write out the cycle numbers at the top of the table.
	for (x = 0 ; x < number_of_columns ; x++){
		document.write("<td align='center'><b>" + (x+1) + "</b></td>");
	}

	document.write("</tr>");

	// Create each row in the table.
	for (x = 0 ; x < number_of_rows ; x++){
		// Insert the Instructions into the table.
		if (parent.top_frame.instruction_array[x].destination_register == "null"){
			// Store instructions must be handled in a special way.
			if (parent.top_frame.instruction_array[x].operator.name == "fp_sd"  || parent.top_frame.instruction_array[x].operator.name == "int_sd"){
				document.write("<tr><td>&nbsp<b>" + x + "</b>&nbsp</td><td><input name='instruction' readonly='1' size='25' value='" + parent.top_frame.instruction_array[x].operator.name + " (" + parent.top_frame.instruction_array[x].source_register1 + ", Offset, " + parent.top_frame.instruction_array[x].source_register2 + ")'>");
			}
			else {
				document.write("<tr><td>&nbsp<b>" + x + "</b>&nbsp</td><td><input name='instruction' readonly='1' size='25' value='" + parent.top_frame.instruction_array[x].operator.name + " (" + parent.top_frame.instruction_array[x].source_register1 + ", " + parent.top_frame.instruction_array[x].source_register2 + ")'>");
			}
		}
		else {
			document.write("<tr><td>&nbsp<b>" + x + "</b>&nbsp</td><td><input name='instruction' readonly='1' size='25' value='" + parent.top_frame.instruction_array[x].operator.name + " (" + parent.top_frame.instruction_array[x].destination_register + ", " + parent.top_frame.instruction_array[x].source_register1 + ", " + parent.top_frame.instruction_array[x].source_register2 + ")'>");
		}
		// Create the input boxes for each column in the row.
		for (y = 0 ; y < number_of_columns ; y++){
			document.write("<td><input name='column" + y + "' readonly='1' size='7'></td>");
		}
		document.write("</td></tr>");
	}

	// Create the buttons at the bottom of the display.
	document.write("</table><input type='button' value='Step' onClick='Step();'>&nbsp;<input type='button' value='Execute All Instructions' 	onClick='Step_To_End();'></form>");
}


// **************************************************************************************


// *** Main Section ***

// Determine if forwarding is enabled.
if (parent.top_frame.document.forwarding_form.enabled_checkbox.checked){
	data_forwarding = 1;
	//document.write("<p>Data Forwarding is enabled.<p>");
	// Data is forwarded so there is no additional delay.
	non_forward_delay = 0;
}
else {
	data_forwarding = 0;
	//document.write("<p>Data Forwarding is disabled.<p>");
	non_forward_delay = 2;
}

// Start with the current cycle being 0.
var current_cycle = 0;

// The number of rows will be equal to the number of instructions that have been entered.
var number_of_rows = parent.top_frame.total_instructions;

// The number of columns is computed as the maximum number of cycles required by the instructions.
var number_of_columns = 0;
for (i = 0 ; i < number_of_rows ; i++){
	number_of_columns += ((parent.top_frame.instruction_array[i].operator.execution_cycles) + 4);
}

// **************************************************************************************
