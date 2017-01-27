var myCache;

function openLink(address) {
    window.open(address,'_blank')
}

//Function that is called when the whole HTML page load
$(function () {
    "use strict";

    /*
     div positions where to put stuff
     */
    var divCache = $("#tdirect");
    var tableAccess = $("#tabellaPlace");
    var textArea = $("#textarea1");
    var tableDiv = $("#ByteAddress");
    var statistics = $("#statistics");
    var addTabHead = $("#addHeadTable");
    var mappingMethod = null;
    var arrayInput; // array inputs

    $('#createCacheBox').hide();
    $('#newButton').on('click', function () {
        $('#createCacheBox').slideDown();
    });
    $('#closeCacheBox').on('click', function () {
        $('#createCacheBox').slideUp();
    });
    $('#closeCacheBox2').on('click', function () {
        $('#createCacheBox').slideUp();
    });


    /*
     the simulator setting variables entered by the user and arising.
           All values are calculated as exponents.
           For example, if I choose a memory to 16MB then MemorySize = 24.
           Because pow (2, 24) = 16MB.

           This choice is determined by the ease of doing calculations in large numbers simply
           subtracting or adding the exponents, since with the same base.
     */
    var memorySize;
    var cacheSize;
    var blockSize;
    var setSize;
    var algorithm;
    var blocksInCache;
    var bitsInTag;
    var offSet;
    var setsInCache;
    var hitCnt; // hit counter
    var hitPercent; // hit counter
    var missCnt; // miss counter
    var missPercent; // miss counter
    var index = 0; //Index representing the current position to iterate the array of RAM accesses
    var DmCnt = 0; // direct mapping counter
    var FaCnt = 0; // fully associated counter
    var SaCnt = 0; // set associated counter
    var DmId = "";
    var FaId = "";
    var SaId = "";
    var compHitArrayData = [];
    var compHitArrayLabels = [];
    var compHitArrayColors = [];
    var dataObj = [];
    // var compHitArrayYlabels = [] ;
    var isRun = false;
    var canvasCtx = $('#myChart');
    var configCtx = {
        type: 'bar',
        options: {
            responsive: true,
            scales: {
                yAxes: [{
                    // stacked: true,
                    ticks: {
                        beginAtZero: true,
                        max: 1
                    }
                }],
                xAxes: [{
                    // stacked: true,
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    };
    var myLineChart = new Chart(canvasCtx, configCtx);

    /*
     function closely linked to the function submit.
     read the description of the function submit ();
     */
    function init() {
        //Now we set the 3 address parameters
        if (mappingMethod == "Direct") {

            offSet = blockSize;
            blocksInCache = cacheSize - offSet;
            bitsInTag = memorySize - blocksInCache - offSet;
            var temp = Math.pow(2, blocksInCache);
            myCache = new CacheDirect(temp);
        }

        if (mappingMethod == "Fully") {
            blocksInCache = 0;
            offSet = blockSize;
            bitsInTag = memorySize - offSet;
            var bic = cacheSize - blockSize;
            var temp = Math.pow(2, bic);
            myCache = new CacheFAssociative(temp);
        }

        if (mappingMethod == "Set") {
            offSet = blockSize;
            setsInCache = cacheSize - setSize - blockSize;
            bitsInTag = memorySize - setsInCache - offSet;
            if (setsInCache == 0) {
                mappingMethod = "Fully";
                alert("For the chosen input values the cache mapping method corresponds to a Fully Associative method.");
                return init();
            }
            var temp = Math.pow(2, cacheSize - blockSize);
            myCache = new CacheSAssociative(temp, Math.pow(2, setSize));
        }

        hitCnt = 0;
        missCnt = 0;
        TableInAccessMemory_Render(textArea, tableAccess); //Create Access Table
        createNewStatistics();
        if (mappingMethod == "Set") {
            SA_Render(divCache, myCache);
        } else {
            Cache_Render(divCache, myCache);
        }
        //Create the cache based on the data in Access
        $(".sideButton").show();
    }


    /*
     Function that is called when you choose to generate a random input to the simulator
           The function returns a string of randomly generated memory access via sub algorithms that simulate
           - The behavior of a while loop (repeats previous logons)
           - A single memory access
           - The reading of an array
     */

    $('#artTrace').on('click', function () {
        var stringToInput = trace.art;
        textArea.val(stringToInput.join('\n'))
    });
    $('#mcfTrace').on('click', function () {
        var stringToInput = trace.mcf;
        textArea.val(stringToInput.join('\n'))
    });
    $('#swimTrace').on('click', function () {
        var stringToInput = trace.swim;
        textArea.val(stringToInput.join('\n'))
    });

    function simulation() { // simulate operation
        var dimAddress = parseInt($("#ramSizeSelect").val());
        if ($('#ramSizeInput').val()/1){
            dimAddress =parseInt(Math.log2($('#ramSizeInput').val()).toFixed(0)) + parseInt($('#ramSizeUnit').val());
        }
        var hexLength = 6;
        var maxRange = Math.pow(2, dimAddress);
        var accessCnt = Math.floor(Math.random() * 220) + 15; //Number of accesses in an interval [15, 110]
        var used = []; //Array containing the values already entered
        var usedArray = [];
        var stringToInput = [];
        var newValue;

        for (var i = 0; i < accessCnt; i++) {
            var selection = Math.floor(Math.random() * 7) + 1;
            switch (selection) {
                default: //It simulates a simple memory access is not present among those used
                    newValue = Math.floor(Math.random() * maxRange);
                    stringToInput.push(DecToHex(newValue, hexLength));
                    used.push(DecToHex(newValue, hexLength));
                    break;

                case 1: //Simulates the use of an array
                    var selection2 = Math.floor(Math.random() * 1) + 0;
                    if (usedArray.length == 0) selection2 = 0;
                    if (selection2 == 0) //If it is zero creates a new array and simulates access
                    {
                        newValue = Math.floor(Math.random() * maxRange);
                        var dimArray = Math.floor(Math.random() * 20) + 1;
                        for (var j = 0; j < dimArray; j++) {
                            stringToInput.push(DecToHex(newValue + j, hexLength));
                        }
                        var newArray = new accessArray(newValue, dimArray);
                        usedArray.push(newArray);

                    } else { //Access an array already created
                        var oldArrayIndex = Math.floor(Math.random() * usedArray.length - 1) + 0;
                        for (var j = 0; j < usedArray[oldArrayIndex].size; j++) {
                            stringToInput.push(DecToHex(usedArray[oldArrayIndex].starterValue + j, hexLength));
                        }
                    }
                    break;
                case 2: //Recalls accesses simulating
                    var fromIns = Math.floor(Math.random() * ((used.length - 1) - 0 + 1) + 0);
                    var toIns = Math.floor(Math.random() * ((used.length - 1) - fromIns + 1) + fromIns);
                    for (var j = fromIns; j < toIns; j++) {
                        stringToInput.push(used[j]);
                    }
                    break;
            }
        }
        // console.log(stringToInput);
        textArea.val(stringToInput.join('\n'));
        // console.log(textArea);
        return;
    }


    /*
     Function that is called if you press the button to generate a random input.
     How does it work:
     */
    $("#randomInputButton").on("click", simulation);


    /*
     Function that takes care of converting a decimal number
     in a HEX string length "charactersNum"
     */
    function DecToHex(decimal, charactersNum) {
        var hexString = decimal.toString(16);
        var length = hexString.length;
        if (length < charactersNum) {
            var zeroCnt = charactersNum - length;
            for (var i = 0; i < zeroCnt; i++) {
                hexString = "0" + hexString;
            }
        }
        return hexString.toUpperCase();
    }


    /*
     Function that handles the upload input from txt file
     */
    if (window.File && window.FileList && window.FileReader) {
        var filesInput = document.getElementById("importFromFileButton");

        filesInput.addEventListener("change", function (event) {

            var file = event.target.files[0];

            //Only plain text
            if (!file.type.match('plain')) {
                alert("filetype not supported");
                return false;
            }

            var picReader = new FileReader();

            picReader.addEventListener("load", function (event) {
                var textFile = event.target.result;
                textArea.val(textFile);
            });

            //Read the text file
            picReader.readAsText(file);

        });
    }


    /*
     CreateNewStatistics()
     Function that creates a new statistics block.
           Initializes the new block with the current simulation settings.

           This function is called each time you start a new simulation.
           What should you do? You must create a new block that will be rendered each instruction.
           The new block should not replace the old one, but ask yourself above. In order to
           be able to compare the various simulations.

           - If there is already a "simulazione_corrente" item then removes that element the id.
           - Creates a new block and assigns the label "simulazione_corrente".

           The Label step is important, as it allows me to render each statement
           only on the simulation in progress and block.
     */
    function createNewStatistics() {
        var a = $("#nuovoStat");

        if (a != undefined) {
            a.removeAttr('id');
        }

        if (mappingMethod == "Direct") {
            statistics.prepend(
                '<div class="well well-sm" id="nuovoStat">' +
                '<table class="tableStat"><tr><td><b>Memory Size:</b> 2<sup>' +
                memorySize + '</sup></td><td><b>Cache Size:</b> 2<sup>' + cacheSize +
                '</sup></td><td><b>Block Size:</b> 2<sup>' + blockSize +
                '</sup></td><td><b>Mapping Method:</b> ' +
                mappingMethod + '</td></tr></table></div>'
            );
        }

        if (mappingMethod == "Fully") {
            statistics.prepend('<div class="well well-sm" id="nuovoStat"><table class="tableStat"><tr><td><b>Memory Size:</b> 2<sup>' + memorySize + '</sup></td><td><b>Cache Size:</b> 2<sup>' + cacheSize + '</sup></td><td><b>Block Size:</b> 2<sup>' + blockSize + '</sup></td><td><b>Set Size:</b>' + myCache.capacity + '</td><td><b>Mapping Method:</b> ' + mappingMethod + '</td><td><b>Algorithm:</b> ' + algorithm + '</td></tr></table></div>');
        }

        if (mappingMethod == "Set") {
            statistics.prepend('<div class="well well-sm" id="nuovoStat"><table class="tableStat"><tr><td><b>Memory Size:</b> 2<sup>' + memorySize + '</sup></td><td><b>Cache Size:</b> 2<sup>' + cacheSize + '</sup></td><td><b>Block Size:</b> 2<sup>' + blockSize + '</sup></td><td><b>Set Size:</b> 2<sup>' + setSize + '</sup></td><td><b>Mapping Method:</b> ' + mappingMethod + '</td><td><b>Algorithm:</b> ' + algorithm + '</td></tr></table></div>');

            currentStatistic = $("#nuovoStat");
        }
    }


    /*
     Function that is called when you click the 'Create' button
           What to do:
           - Must initialize global variables
           - Ed graphically set the cache with data held

           The function is divided into two. The submit function calls the init function
           that initializes the variables related to the entered settings.

           The function is divided into two because, in the case where the Set Associative turns
           Fully Associative is done in a recursive call to the init function.
     */
    function submit() {

        var isOk = textArea.val().split('\n').every(isHex);
        if (!isOk) {
            alert("There's an error in the input data.");
            return false;
        }
        index = 0;
        memorySize = parseInt($("#ramSizeSelect").val());
        if ($('#ramSizeInput').val()/1){
            memorySize =parseInt(Math.log2($('#ramSizeInput').val()).toFixed(0)) + parseInt($('#ramSizeUnit').val());
        }
        cacheSize = parseInt($("#cacheSizeSelect").val());
        if ($('#cacheSizeInput').val()/1){
            cacheSize =parseInt(Math.log2($('#cacheSizeInput').val()).toFixed(0)) + parseInt($('#cacheSizeUnit').val());
        }
        blockSize = parseInt($("#blockSizeSelect").val());
        if ($('#blockSizeInput').val()/1){
            blockSize =parseInt(Math.log2($('#blockSizeInput').val()).toFixed(0)) + parseInt($('#blockSizeUnit').val());
        }
        // if (blockSize == cacheSize) {
        //     alert('blocksize = ' + blockSize + '\ncachesize =' + cacheSize + '\nchange the blocksize or cachesize')
        // }
        setSize = parseInt($("#setsize").val());
        mappingMethod = $("#method").val();
        algorithm = $("#algorithm").val();
        $('#createCacheBox').slideUp();
        return init()
    }


    /*
     Function that checks whether the passed value is effectively a HEX string
     */
    function isHex(value) {
        return /^[0-9A-F]+$/i.test(value);
    }


    /* create random color
     for charts
     */
    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }


    /*
     Each time you clicked the "Save Changes" button of the input window is called the submit
     function that will initialize the data for the new simulation.
     */
    $("#submitButton").on("click", submit);


    /*
     Function due to update the statistics in the current statistics block.
     */
    function updateStatistics() {
        var div = $("#nuovoStat");
        div.empty();
        if (mappingMethod == "Direct") {
            hitPercent = (((hitCnt) / index) * 100).toFixed(2);
            missPercent = (((missCnt) / index) * 100).toFixed(2);
            if (isRun) {
                DmId = "Direct Mapping" + " #" + DmCnt ;
                // compHitArrayColors.push(getRandomColor());
                compHitArrayColors.push('#1da7ff');
                compHitArrayData.push((hitPercent / 100).toFixed(4));
                compHitArrayLabels.push(DmId);
            }
            DmCnt++;
            div.append(
                '<h4><b>'+ DmId +'</b></h4><hr>'+
                '<div class="col-md-8"><table class="tableStat"><tr><td><b>Memory Size:</b> 2<sup>'
                + memorySize + '</sup></td><td><b>Cache Size:</b> 2<sup>' + cacheSize +
                '</sup></td><td><b>Block Size:</b> 2<sup>' + blockSize +
                '</sup></td></tr><tr><td><b>Accesses:</b>' + index + '</td><td> <b>Hits: </b>' + hitCnt +
                ' (' + hitPercent + '%) </td><td><b>Misses: </b>' + missCnt +
                ' (' + missPercent + '%)</td></tr></table></div>' +
                '<div class="col-md-4"><canvas id="dir' + DmCnt + '" class="chart"></canvas></div>'
            );
            var ctx = $('#dir' + DmCnt);
            var dirData = [missCnt, hitCnt];
            var myChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [
                        "Miss",
                        "Hit"
                    ],
                    datasets: [
                        {
                            data: dirData,
                            backgroundColor: [
                                "#FF6384",
                                "#36A2EB"
                            ],
                            hoverBackgroundColor: [
                                "#FF6380",
                                "#36A2E0"
                            ]
                        }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            display:false
                        }],
                        xAxes: [{
                            display:false
                        }]
                    }
                }
            });
        }

        if (mappingMethod == "Fully") {
            hitPercent = (((hitCnt) / index) * 100).toFixed(2);
            missPercent = (((missCnt) / index) * 100).toFixed(2);
            if (isRun) {
                FaId = "FullyAssociative / " + algorithm + " #" + FaCnt ;
                // compHitArrayColors.push(getRandomColor());
                compHitArrayColors.push('#1da7ff');
                compHitArrayData.push((hitPercent / 100).toFixed(4));
                compHitArrayLabels.push(FaId);
            }
            FaCnt++;
            div.append(
                '<h4><b>'+ FaId +'</b></h4><hr>'+
                '<div class="col-md-8"><table class="tableStat"><tr><td><b>Memory Size:</b> 2<sup>'
                + memorySize +
                '</sup></td><td><b>Cache Size:</b> 2<sup>'
                + cacheSize +
                '</sup></td><td><b>Block Size:</b> 2<sup>'
                + blockSize +
                '</sup></td></tr><tr><td><b>Set Size:</b>'
                + myCache.capacity +
                '</td><td><b>Mapping Method:</b> '
                + mappingMethod +
                '</td><td><b>Algorithm:</b> '
                + algorithm +
                '</td></tr><tr><td><b>Accesses:</b>'
                + index +
                '</td><td> <b>Hits: </b>'
                + hitCnt +
                ' (' + hitPercent + '%) </td><td><b>Misses: </b>'
                + missCnt +
                ' (' + missPercent + '%)' +
                '</td></tr></table></table></div>' +
                '<div class="col-md-4"><canvas id="fa' + FaCnt + '" class="chart"></canvas></div>'
            );
            var ctx = $('#fa' + FaCnt);
            var dirData = [missCnt, hitCnt];
            var myChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [
                        "Miss",
                        "Hit"
                    ],
                    datasets: [
                        {
                            data: dirData,
                            backgroundColor: [
                                "#FF6384",
                                "#36A2EB"
                            ],
                            hoverBackgroundColor: [
                                "#FF6380",
                                "#36A2E0"
                            ]
                        }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            display:false
                        }],
                        xAxes: [{
                            display:false
                        }]
                    }
                }
            });
        }

        if (mappingMethod == "Set") {
            hitPercent = (((hitCnt) / index) * 100).toFixed(2);
            missPercent = (((missCnt) / index) * 100).toFixed(2);
            if (isRun) {
                SaId = "SetAssociative ( " + Math.pow(2,setSize) + "way ) / " + algorithm +" #" + SaCnt ;
                // compHitArrayColors.push(getRandomColor());
                compHitArrayColors.push('#1da7ff');
                compHitArrayData.push((hitPercent / 100).toFixed(4));
                compHitArrayLabels.push(SaId);
            }
            SaCnt++;
            div.append(
                '<h4><b>'+ SaId +'</b></h4><hr>'+
                '<div class="col-md-8"><table class="tableStat"><tr><td><b>Memory Size:</b> 2<sup>' + memorySize +
                '</sup></td><td><b>Cache Size:</b> 2<sup>' + cacheSize + '</sup></td><td><b>Block Size:</b> 2<sup>'
                + blockSize + '</sup></td></tr><tr><td><b>Set Size:</b> 2<sup>' + setSize + '</sup></td><td><b>Mapping Method:</b> '
                + mappingMethod + '</td><td><b>Algorithm:</b> ' + algorithm + '</td></tr><tr><td><b>Accesses:</b>' + index
                + '</td><td> <b>Hits: </b>' + hitCnt + ' (' + hitPercent + '%) ' +
                '</td><td><b>Misses: </b>' + missCnt + ' (' + missPercent + '%)</td></tr>' +
                '</table></div>' +
                '<div class="col-md-4"><canvas id="sa' + SaCnt + '" class="chart"></canvas></div>'
            );
            var ctx = $('#sa' + SaCnt);
            var dirData = [missCnt, hitCnt];
            var myChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [
                        "Miss",
                        "Hit"
                    ],
                    datasets: [
                        {
                            data: dirData,
                            backgroundColor: [
                                "#FF6384",
                                "#36A2EB"
                            ],
                            hoverBackgroundColor: [
                                "#FF6380",
                                "#36A2E0"
                            ]
                        }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            display:false
                        }],
                        xAxes: [{
                            display:false
                        }]
                    }
                }
            });
        }

        if (isRun) {

            myLineChart.data.datasets = [{
                data: compHitArrayData,
                backgroundColor: compHitArrayColors,
                label: "Hit Ratio"
            }];
            myLineChart.data.labels = compHitArrayLabels;

            if (compHitArrayLabels.length > 1) {
                if (compHitArrayLabels[compHitArrayLabels - 1] == compHitArrayLabels[compHitArrayLabels - 2]) {
                    isRun = false;
                }
            }

            myLineChart.update();
        }
    }


    var size;
    var offSetBinaryBit;
    var indexBinaryBit;
    var tagBinaryBit;
    var decimalNumber;
    var binaryNumber;
    var currentStatistic;


    /*
     Step function ().
           Function that is called each time you press the "Step" button.
           His task is:
           - To take the current memory access and add it to the cache.
           - Dividing the address into blocks
           - To call the various functions renders
     */
    function step() {
        isRun = false;
        if (index < arrayInput.length) {
            selectElementTableAccess(arrayInput, index);
            var element = arrayInput[index];
            decimalNumber = parseInt(element, 16);
            binaryNumber = decToBinaryString(decimalNumber);
            if (mappingMethod == "Direct") {
                offSetBinaryBit = getPartOfBinary(binaryNumber, (memorySize - offSet), memorySize);
                indexBinaryBit = getPartOfBinary(binaryNumber, bitsInTag, blocksInCache + bitsInTag);
                tagBinaryBit = getPartOfBinary(binaryNumber, 0, bitsInTag);
            }

            if (mappingMethod == "Fully") {
                tagBinaryBit = getPartOfBinary(binaryNumber, 0, bitsInTag);
                offSetBinaryBit = getPartOfBinary(binaryNumber, (memorySize - offSet), memorySize);
            }

            if (mappingMethod == "Set") {
                offSetBinaryBit = getPartOfBinary(binaryNumber, (memorySize - offSet), memorySize);
                indexBinaryBit = getPartOfBinary(binaryNumber, bitsInTag, setsInCache + bitsInTag);
                tagBinaryBit = getPartOfBinary(binaryNumber, 0, bitsInTag);
            }

            tableAddress_Render(element);
            var nBlock = parseInt(indexBinaryBit, 2);
            var nTag = parseInt(tagBinaryBit, 2);
            blockPosition(nBlock, nTag, element);
            tableAddress_Render(element);
            index++;
            updateStatistics();
        } else {
            alert("All memory accesses have been executed\nPress 'New' to setup a new simulation");
        }
    }


    /*
     Each time that the button is clicked step is called step function
     */
    $("#nextStepButton").on("click", step);


    function runStep() {
        isRun = true;
        var element = arrayInput[index];
        decimalNumber = parseInt(element, 16);
        binaryNumber = decToBinaryString(decimalNumber);
        if (mappingMethod == "Direct") {
            indexBinaryBit = getPartOfBinary(binaryNumber, bitsInTag, blocksInCache + bitsInTag);
            tagBinaryBit = getPartOfBinary(binaryNumber, 0, bitsInTag);
        }
        else if (mappingMethod == "Fully") {
            tagBinaryBit = getPartOfBinary(binaryNumber, 0, bitsInTag);
        }
        else if (mappingMethod == "Set") {
            indexBinaryBit = getPartOfBinary(binaryNumber, bitsInTag, setsInCache + bitsInTag);
            tagBinaryBit = getPartOfBinary(binaryNumber, 0, bitsInTag);
        }

        var nBlock = parseInt(indexBinaryBit, 2);
        var nTag = parseInt(tagBinaryBit, 2);
        // console.log(indexBinaryBit,tagBinaryBit);
        runBlockPosition(nBlock, nTag, element);
        index++;
    }


    /*
     When you press the RUN button.
     It is called for all the remaining memory accesses the function step.
     */
    $("#runButton").on("click", function () {
        for (var i = index; i < arrayInput.length; i++) {
            try{
                runStep();
            }
            catch (error){
                alert('your inputs are grammatically incorrect');
                break;
            }
        }
        updateStatistics();
        location.href = "#nuovoStat"
    });


    /*
     Place the function block is responsible to call the method places this block
           MyCache object.
           It also takes care of calling Cache_Render functions.

           The variable result takes care of storing the result of the placement.
           Or if there has been a cache HIT or MISS cache.
     */
    var result;


    function blockPosition(block, tag, addressAccess) {
        result = myCache.blockPosition(block, tag, addressAccess, algorithm);
        if (mappingMethod == "Set") {
            SA_Render(divCache, myCache);
        } else {
            Cache_Render(divCache, myCache);
        }
        if (result == 0) {
            hitCnt++;
        } else {
            missCnt++;
        }
    }


    function runBlockPosition(block, tag, addressAccess) {
        result = myCache.blockPosition(block, tag, addressAccess, algorithm);
        if (result == 0) {
            hitCnt++;
        } else {
            missCnt++;
        }
    }


    /*
     Auxiliary function used in the STEP function.
           a string outlet and the start and end positions
           He takes care to return a portion of string.
     */
    function getPartOfBinary(v, start, end) {
        var newPart = "";
        for (var i = start; i < end; i++) {
            newPart += v[i];
        }
        return newPart;
    }


    /*
     Auxiliary function used in the STEP function.
           Took a number takes care of converting it to number TRACK
           and to add in the most significant bit 0 if this does not arrive
           to address size.
     */
    function decToBinaryString(number) {
        var temp = number.toString(2);
        if (temp.length < memorySize) {
            var daAggiungere = "";
            for (var i = 0; i < memorySize - temp.length; i++) {
                daAggiungere += "0";
            }
            temp = daAggiungere + temp;
        }
        return temp;
    }


    /*
     Function that deals with the rendering of the TABLE address of the current details.
     */
    function tableAddress_Render(address) {
        var table = $("#ByteAddress");
        table.empty();
        table.append('<table id="addresstable" class="table table-striped"><thead><tr><th>' + address + '</th></tr></thead><tbody id="taddress"></tbody></table>');
        var columnsPlace = $("#taddress");
        columnsPlace.append('<tr><td>-------------------</td><td>' + memorySize + ' b Address</td><td>-------------------</td></tr>');
        if (mappingMethod == "Direct") {
            columnsPlace.append('<tr><td>Tag: ' + bitsInTag + ' b</td><td>Index: ' + blocksInCache + ' b</td><td>Block Width: ' + offSet + ' b</td></tr>');
            columnsPlace.append('<tr><td>' + tagBinaryBit + '</td><td>' + indexBinaryBit + '</td><td>' + offSetBinaryBit + '</td></tr>');
            tableDiv.append('INDEX = Identifies a blockposition in cache <b>' + parseInt(indexBinaryBit, 2) + '</b><br>');
            tableDiv.append("BLOCK WIDTH = Identifies the bytes sequence inside the block<br>");
            tableDiv.append("TAG = Label associated with the position of the block<br><br>");
        }
        if (mappingMethod == "Fully") {
            columnsPlace.append('<tr><td>Tag: ' + bitsInTag + ' b</td><td> </td><td>Block Width: ' + offSet + ' b</td></tr>');
            columnsPlace.append('<tr><td>' + tagBinaryBit + '</td><td> </td><td>' + offSetBinaryBit + '</td></tr>');
            tableDiv.append("BLOCK WIDTH = Identifies the bytes sequence inside the block<br>");
            tableDiv.append("TAG = Label associated with the position of the block<br><br>");
        }
        if (mappingMethod == "Set") {
            columnsPlace.append('<tr><td>Tag: ' + bitsInTag + ' b</td><td>Index: ' + setsInCache + ' b</td><td>Block Width: ' + offSet + ' b</td></tr>');
            columnsPlace.append('<tr><td>' + tagBinaryBit + '</td><td>' + indexBinaryBit + '</td><td>' + offSetBinaryBit + '</td></tr>');
            tableDiv.append('INDEX = Identifies a blockposition in cache <b>' + parseInt(indexBinaryBit, 2) + '</b><br>');
            tableDiv.append("BLOCK WIDTH = Identifies the bytes sequence inside the block<br>");
            tableDiv.append("TAG = Label associated with the position of the block<br><br>");
        }
        if (result == 0) {
            tableDiv.append("This memory block is already in cache - <b>HIT</b>");
        } else {
            tableDiv.append("This memory block isn't in cache - <b>MISS</b>");
        }
    }


    /*
     Function that takes care of the TABLE rendering of memory access addresses.
     elect the current and makes sure that it is at the center of the table using a autoscroll.
     */
    function selectElementTableAccess(arrayInput, index) {
        var table = tableAccess;
        table.empty();
        table.append(
            '<div class="div-table-content"><table id="accesstable" class="table table-striped"><tbody id="tmemoryaccess"></tbody></table></div>');
        var linesPlace = $("#tmemoryaccess");
        arrayInput.forEach(function (lines, i) {
            if (index == i) {
                linesPlace.append('<tr><td class="pieno" id="selectedAccess" style="color: white;">' + lines + '</td></tr>');
                var el = document.getElementById("selectedAccess");
                // el.scrollIntoView(false);
            } else {
                linesPlace.append('<tr><td>' + lines + '</td></tr>');
            }
        });
    }


    /*
     Function that takes care of the TABLE rendering of memory access addresses.
     This function is called only once, when a new simulation is started.
     */
    function TableInAccessMemory_Render(area, table) {
        table.empty();
        table.append('<div class="div-table-content"><table id="accesstable" class="table table-striped"><tbody id="tmemoryaccess"></tbody></table></div>');
        var linesPlace = $("#tmemoryaccess");
        var linesArray = area.val().split('\n');
        arrayInput = linesArray;
        size = linesArray.length;
        linesArray.forEach(function (lines, i) {
            linesPlace.append('<tr><td>' + lines + '</td></tr>');
        });
    }


    /*
     Below - the functions that deal with the render caches
     */
    function SA_Render(element, cache) {
        element.empty();
        cache.sets.forEach(function (set, i) {
            addTabHead.empty();
            addTabHead.append("<th>Blocks</th><th>Sets</th>");
            var container = $(document.createElement("div"));
            TempCache_Render(container, set);
            container.children('tr').first().prepend('<td rowspan="' + Math.pow(2, setSize) + '"> ' + i + '</td>');
            element.append(container.children());
        });
    }


    function TempCache_Render(element, cache) {
        element.empty();
        cache.frames.forEach(function (frame, i) {
            if (cache.lastOperationIndex === i) {
                if (frame.isFull) {
                    element.append('<tr><td class="pieno ultimo" style="color: white;">Set ' + i + " [Tag: " + frame.tag + '] [LastAccess: ' + frame.lastAccess + ']</td></tr>');
                } else {
                    element.append('<tr><td>Set ' + i + '</td></tr>');
                }
            }
            else {
                if (frame.isFull()) {
                    element.append('<tr><td class="pieno" style="color: white;">Set ' + i + " [Tag: " + frame.tag + '] [LastAccess: ' + frame.lastAccess + ']</td></tr>');
                } else {
                    element.append('<tr><td>Set ' + i + '</td></tr>');
                }
            }
        });
    }


    function Cache_Render(element, cache) {
        element.empty();
        addTabHead.empty();
        addTabHead.append("<th>Blocks</th>");
        cache.frames.forEach(function (frame, i) {
            if (mappingMethod == "Direct") {
                if (cache.lastOperationIndex === i) {
                    if (frame.isFull) {
                        element.append('<tr><td class="pieno ultimo" style="color: white;">Block ' + i + " [Tag: " + frame.tag + '] [LastAccess : ' + frame.lastAccess + ']</td></tr>');
                    } else {
                        element.append('<tr><td>Block ' + i + '</td></tr>');
                    }
                } else {
                    if (frame.isFull()) {
                        element.append('<tr><td class="pieno" style="color: white;">Block ' + i + " [Tag: " + frame.tag + '] [LastAccess: ' + frame.lastAccess + ']</td></tr>');
                    } else {
                        element.append('<tr><td>Block ' + i + '</td></tr>');
                    }
                }
            }

            if (mappingMethod == "Fully") {
                if (cache.lastOperationIndex === i) {
                    if (frame.isFull) {
                        element.append('<tr><td class="pieno ultimo" style="color: white;">Block ' + i + " [T: " + frame.tag + '] [L.A: ' + frame.lastAccess + ']' + /* (' + frame.lruindex + ')</td>*/ '</tr>');
                    } else {
                        element.append('<tr><td>Block ' + i + '</td></tr>');
                    }
                } else {
                    if (frame.isFull()) {
                        element.append('<tr><td class="pieno ultimo" style="color: white;">Block ' + i + " [T: " + frame.tag + '] [L.A: ' + frame.lastAccess + ']' + /* (' + frame.lruindex + ')</td>*/ '</tr>');
                    } else {
                        element.append('<tr><td>Block ' + i + '</td></tr>');
                    }
                }
            }

        });
    }

});
