$('#assess-button').click(function(event) {
    
    //gets form
    const myForm = $('#assessment-form');

    if(! myForm[0].checkValidity()) {
        // If the form is invalid, submit it. The form won't actually submit;
        // this will just cause the browser to display the native HTML5 error messages.
        return;
    }

    // Pull information from form.
    const responses = $('#assessment-form').serializeArray();

    // Get first 4 values if market exists, first 10 values otherwise.
    const userVals = responses[3].value === "NEW MARKET" ? 10 : 4;
    let userInfo = {};
    for (let i = 0; i < userVals; i++) {
        userInfo[responses[i].name] = responses[i].value;
    }

    event.preventDefault();

    //keeps track of current question #
    let count = 1;

    //each index represents the amount of times a level occurs.
    // [level 1, level 2, level 3]
    let  levelArr = [0,0,0];

    let levelPotential = [0,0,0]

    let disqualified = false;

    let questionsList = {}
    let doBetterQuestions = []

    //for when questions hit level zero
    let increaseZeroCase = 0;
    
    //loops through all questions, executes the following function for each question one at a time. 
    $('.answers').each(function(){
        let currentQuestion = $(this);

        //finds checked label
        let answer = currentQuestion.find(':checked');

        let questionKey = answer.attr('name');
        if (typeof questionKey != "undefined") {
            questionKey = questionKey.replace(/[^0-9a-zA-Z, ]/gi, '');
        } else {
            questionKey = "undefined";
        }

        let answerText = answer.val();
        if (typeof answerText != "undefined") {
            answerText = answerText
        } else {
            answerText = "undefined";
        }

        questionsList[questionKey] = answerText;
    
        //if no input
        if(typeof answer.val() == "undefined"){
            count++;
            return;
        }

        //if disabled from selecting no
        if(answer.is(':disabled')){
            count++;
            return;
        }
        
        else{

            //grabs level hidden input corresponding with label in assess.ejs
            let level = answer.parent().find('.points-input').val();
            
            
            if(level == 1){
                levelArr[0]++;
            }

            else if(level == 2){
                levelArr[0]++;
                levelArr[1]++;
            }

            else if(level == 3){
                levelArr[0]++;
                levelArr[1]++;
                levelArr[2]++;
            }

            else if(level == -1){
                count++;
                return;
            }
            
            //case when 0
            else{
                levelArr[0]++;
                levelArr[1]++;
                levelArr[2]++;
                increaseZeroCase++;
            }

        }
        
        //make sure only to increase potential once for each section
        let has0 = false;
        let has1 = false;
        let has2 = false;
        let has3 = false;
        
        currentQuestion.find('.points-input').each(function() {
                let pointlevel = $(this).val()
                
                if(pointlevel == 1 && !has1){
                    levelPotential[0]++;
                    has1 = true;
                }

                if(pointlevel == 2 && !has2){
                    levelPotential[1]++;
                    has2 = true;
                }

                if(pointlevel == 3 && !has3){
                    levelPotential[2]++;
                    has3 = true;
                }


		});
        
        //increase question count
        count++;

    });
    
    //increasing potential to account for questions where zero option was selected 
    for(let z = 0; z < increaseZeroCase; z++){
        levelPotential[0]++;
        levelPotential[1]++;
        levelPotential[2]++;
    }


    //grab final market value.
    let marketLevel = 0;

    for(let i = 0; i < levelArr.length; i++){
        console.log("total for market " + (i+1) + " is " + levelArr[i])
        console.log("total potential is " + levelPotential[i])
        if(levelArr[i] >= levelPotential[i]){
            //isLevel[i] = true;
            marketLevel = i + 1;
        }
        else{
            if(i==0){
                marketLevel = 0;
                break;
            }
        }

    }

    console.log("Market is level: " + marketLevel);

    //no potential to hit therefore return
    if(marketLevel == 3){
        return false;
    }

    //the next level of the market assuming it's been hit.
    let potentialLevel = marketLevel + 1;

    //grabing missed numbers from each section

    let missedSections = [[],[],[],[]]

    //keep track of current question
    let count =1;
        
    //count of potential market level 
    let countPotential = 0;

    //loop through questions again
    $('.answers').each(function(){
        let currentQuestion = $(this);

        //finds checked label
        let answer = currentQuestion.find(':checked');
    
        //if no input
        if(typeof answer.val() == "undefined"){
            count++;
            return;
        }

        //if disabled from selecting no
        if(answer.is(':disabled')){
            count++;
            return;
        }
        
        else{

            //grabs level hidden input corresponding with label in assess.ejs
            let level = answer.parent().find('.points-input').val();
                
            if(level >= marketLevel + 1){
                count++;
                return;
            }
            
            else if(level == -1){
                count++;
                return;
            }
            
            //case when question has value that isn't equal to the marketlevel + 1
            else{
                
                let alreadyPushed = false;
                currentQuestion.find('.points-input').each(function() {
                    let pointlevel = $(this).val()

                    //for when more than one options satisfy marketLevel + 1, no need to push the count twice 

                    if(pointlevel == marketLevel + 1){
                        if(count < 17 && !alreadyPushed){
                            missedSections[0].push(count);
                            alreadyPushed = true;
                        }

                        else if(count > 16 && count < 39 && !alreadyPushed){
                            missedSections[1].push(count);
                            alreadyPushed = true;
                        }
    
                        else if(count > 38 && count < 59 && !alreadyPushed){
                            missedSections[2].push(count);
                            alreadyPushed = true;
                        }

                        else{
                            if(!alreadyPushed){
                                missedSections[3].push(count);
                                alreadyPushed = true;
                            }
                        }
                    
                    }


	            });

            }
                // go to next question
                count++;
        }

    });

    
    // make sure print statements are only called once
    console.log("Checking for questions to fix");
    let section1Echoed = false;
    let section2Echoed = false;
    let section3Echoed = false;
    let section4Echoed = false;
    for(let j = 0; j < missedSections.length; j++){
        if(missedSections[j].length == 0){
            continue;
        }

        else{
                if(j == 0 && !section1Echoed){
                    console.log("Questions that need to be fixed for first section:");
                    section1Echoed = true;
                }

                else if(j==1 && !section2Echoed){
                    console.log("Questions that need to be fixed for second section:");
                    section2Echoed = true;
                }

                else if(j == 2 && !section3Echoed){
                    console.log("Questions that need to be fixed for third section:");
                    section3Echoed = true;

                }

                else{   
                    if(!section4Echoed){
                        console.log("Questions that need to be fixed for fourth section:");
                        section4Echoed = true;
                    }
                }

                let lis = document.getElementById("assessment-q-list").getElementsByTagName("li");
                for(let k = 0; k < missedSections[j].length; k++){
                    let index = missedSections[j][k]
                    console.log(index);
                    doBetterQuestions.push("<span class=\"boldanswer\">" + index.toString() + "</span>" + ": " + lis[index - 1].getElementsByTagName("p")[0].innerText)
                }
        }
    }
    
    if(marketLevel == 0){
        for(let x = 0; x < levelArr.length; x++){
            if(levelArr[x] >= levelPotential[x]){
                marketLevel = x + 1;
            }
        }
    }

    else{
        marketLevel = marketLevel + 1;
    }

    console.log("fix these questions to become market level: " + marketLevel);

    /*****************************************************************
     * 
     * ---------------------> SEND TO DATABASE <---------------------
     * 
     ****************************************************************/

    const marketExists = userVals === 4 ? "true" : "false";

    const sendData = {
        existing: marketExists,
        level: marketLevel,
        betterQuestions: doBetterQuestions, 
        marketInfo: userInfo, 
        questions: questionsList
    }

    $.post('/submit-assess', {data: JSON.stringify(sendData)});

    const href='results/' + userInfo.marketName + '/' + marketLevel;
    location.href=href;
});
