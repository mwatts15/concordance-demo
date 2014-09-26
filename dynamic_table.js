function dynamicTableInit(table, allowColumnHiding) {
    if (typeof allowColumnHiding == 'undefined') allowColumnHiding = true;
    var startRow = '<tr>';
    var endRow = '</tr>';
    var rows = table.getElementsByTagName('tr');
    var length = rows.length;
    if (allowColumnHiding) rows[0].oncontextmenu = dynamicTableMenu;
    var headerCells = dynamicTableInitTableHeader(rows[0], allowColumnHiding);
    var rowLength = headerCells.length;
    var header = [startRow, rows[0].innerHTML, endRow].join('');
    var data = [];
    var tableCache = [];
    for (var i = 1; i < length; i++) {
        data[i - 1] = [];
        var cells = rows[i].getElementsByTagName('td');
        tableCache[i] = [];
        for (var j = 0; j < rowLength; j++) {
            tableCache[i][j] = cells[j];
            data[i - 1][j] = valueCalc(cells[j].innerHTML, j)
        }
        data[i - 1][rowLength] = rows[i]
    }
    if (allowColumnHiding) {
        for (var i = 0; i < rowLength; i++) {
            var className = 'column' + (i + 1);
            addClassToElement(headerCells[i], 'column' + (i + 1));
            for (var j = 1; j < length; j++) addClassToElement(tableCache[j][i], className)
        }
    }
    var compareFunctions = [];
    for (var i = 0; i < rowLength; i++) compareFunctions.push(dynamicTableGenericComparison(i));
    table.dataObject = {
        'headerCells': headerCells,
        'data': data,
        'sortOrder': 0,
        'sortColumn': null,
        'compareFunctions': compareFunctions
    }
};
var dtRegExp1 = /<\/?[^>]+>/gi;
var dtRegExp2 = /[,|$]/g;
var dtEmptySpace = '';
var dtDate = null;

function valueCalc(datum) {
    datum = datum.replace(dtRegExp1, dtEmptySpace);
    if (datum == dtEmptySpace) return datum;
    else if (!isNaN(datum.replace(dtRegExp2, dtEmptySpace) - 0)) return datum.replace(dtRegExp2, dtEmptySpace) - 0;
    else if (window['parseDate'] && (dtDate = parseDate(datum))) return dtDate.getTime();
    return datum
}

function dynamicTableInitTableHeader(headerRow) {
    var headers = headerRow.getElementsByTagName('th');
    if (!headers.length) headers = headerRow.getElementsByTagName('td');
    var length = headers.length;
    for (var i = 0; i < length; i++) dynamicTableInitHeader(headers[i], i);
    return headers
};

function dynamicTableInitHeader(headerCell, colNum) {
    headerCell.onclick = function() {
        dynamicTableSortTable(this, colNum)
    }
};

function dynamicTableGenericComparison(colNum) {
    function f(r1, r2) {
        var v1 = r1[colNum];
        var v2 = r2[colNum];
        if (v1 == v2) return 0;
        if (v1 > v2) return 1;
        return -1
    };
    return f
};

function dynamicTableSortTable(element, columnNum) {
    while (element.parentNode && element.nodeName != 'TABLE') element = element.parentNode;
    if (!element.parentNode) return;
    var dataObject = element.dataObject;
    //if (!dataObject) initDynamicTable(element);
    if (dataObject.sortColumn != null) {
        removeClassFromElement(dataObject.headerCells[dataObject.sortColumn], dataObject.sortOrder ? 'sortDesc' : 'sortAsc')
    }
    if (dataObject.sortColumn == columnNum) {
        var oldData = dataObject.data;
        var dataLength = oldData.length;
        dataObject.data = [];
        for (var i = 0; i < dataLength; i++) dataObject.data[i] = oldData[dataLength - i - 1];
        dataObject.sortOrder = dataObject.sortOrder ? 0 : 1
    } else {
        sortFunction = dataObject.compareFunctions[columnNum];
        dataObject.data.sort(sortFunction);
        dataObject.sortColumn = columnNum;
        dataObject.sortOrder = 0
    }
    addClassToElement(dataObject.headerCells[dataObject.sortColumn], dataObject.sortOrder ? 'sortDesc' : 'sortAsc');
    dynamicTableUpdateTable(element)
};

function dynamicTableUpdateTable(table) {
    var tbody = table.getElementsByTagName('tr')[1].parentNode;
    var data = table.dataObject.data;
    var rowIndex = data[0].length - 1;
    var dataLength = data.length;
    for (var i = 0; i < dataLength; i++) tbody.appendChild(data[i][rowIndex])
};

function dynamicTableMenu(e) {
    var div = document.getElementById('dynamicTableMenu');
    if (div) div.parentNode.removeChild(div);
    if (!e) e = event;
    var mp = getMousePosition(e);
    div = document.createElement('div');
    div.id = 'dynamicTableMenu';
    div.style.left = mp.x + 'px';
    div.style.top = mp.y + 'px';
    var ul = document.createElement('ul');
    var cells = this.getElementsByTagName('th');
    if (!cells) cells = this.getElementsByTagName('td');
    var length = cells.length;
    var regExp = /<\/?[^>]+>/gi;
    for (var i = 0; i < length; i++) {
        var li = document.createElement('li');
        li.innerHTML = cells[i].innerHTML.replace(regExp, "");
        if (!li.innerHTML) li.innerHTML = 'Column ' + (i + 1);
        var input = '<input type="checkbox" value="' + 'column' + (i + 1) + '" onclick="toggleVisible(this);"';
        if (getRule(".column" + (i + 1)) == null) input += ' CHECKED';
        input += '> ';
        li.innerHTML = input + li.innerHTML;
        ul.appendChild(li)
    }
    div.appendChild(ul);
    var closeButton = document.createElement('button');
    closeButton.innerHTML = 'Close';
    closeButton.onclick = function() {
        var checkboxes = this.parentNode.getElementsByTagName('input');
        var someChecked = false;
        var length = checkboxes.length;
        for (var i = 0; i < length; i++) someChecked = (someChecked || checkboxes[i].checked);
        if (someChecked) document.body.removeChild(div);
        else alert("You can't close the window while no columns are visible.")
    };
    div.appendChild(closeButton);
    div.onmousedown = function(e) {
        startMove(e, this)
    };
    document.body.appendChild(div);
    return false
};

function toggleVisible(checkbox) {
    if (checkbox.checked) showClass(checkbox.value);
    else hideClass(checkbox.value)
};

function getMousePosition(e) {
    return e.pageX ? {
        'x': e.pageX,
        'y': e.pageY
    } : {
        'x': e.clientX + (document.documentElement ? document.documentElement.scrollLeft : document.body.scrollLeft),
        'y': e.clientY + (document.documentElement ? document.documentElement.scrollTop : document.body.scrollTop)
    }
};

function getRule(selectorText) {
    var length = document.styleSheets.length;
    for (var i = 0; i != length; i++) {
        var rule = getRuleFromStyleSheet(document.styleSheets[i], selectorText);
        if (rule) return rule
    }
    return null
};

function getRuleFromStyleSheet(styleSheet, selectorText) {
    var length = styleSheet.rules ? styleSheet.rules.length : styleSheet.cssRules.length;
    for (var i = 0; i != length; i++) {
        var rule = styleSheet.rules ? styleSheet.rules[i] : styleSheet.cssRules[i];
        if (rule.selectorText == selectorText) return {
            'rule': rule,
            'styleSheet': styleSheet,
            'ruleIndex': i
        }
    }
    return null
};

function addRuleToStyleSheet(styleSheet, rule) {
    if (styleSheet.insertRule) styleSheet.insertRule(rule, styleSheet.cssRules.length);
    else if (styleSheet.addRule) styleSheet.addRule(rule.substring(0, rule.indexOf("{")), rule.substring(rule.indexOf("{") + 1, rule.indexOf("}")))
};

function removeRuleFromStyleSheet(styleSheet, ruleIndex) {
    if (styleSheet.deleteRule) styleSheet.deleteRule(ruleIndex);
    else if (styleSheet.removeRule) styleSheet.removeRule(ruleIndex)
};

function showClass(className) {
    var rule = getRule("." + className);
    if (rule) removeRuleFromStyleSheet(rule.styleSheet, rule.ruleIndex)
};

function hideClass(className) {
    var rule = getRule("." + className);
    if (!rule) addRuleToStyleSheet(document.styleSheets[0], "." + className + "{ display: none; } ")
};

function startMove(e, obj) {
    window['movingObject'] = obj;
    window['lastMousePos'] = getMousePosition(e ? e : window.event);
    obj.onscroll = stopMove;
    document.onmousemove = doMove;
    document.onmouseup = stopMove
};

function stopMove() {
    window['movingObject'] = null;
    window['lastMousePos'] = null;
    document.onmousemove = null;
    document.onmouseup = null
};

function doMove(e) {
    if (!window['movingObject']) return;
    var currentMousePos = getMousePosition(e ? e : window.event);
    var xMove = lastMousePos.x - currentMousePos.x;
    var yMove = lastMousePos.y - currentMousePos.y;
    window['lastMousePos'] = currentMousePos;
    var newX = window['movingObject'].offsetLeft - xMove;
    var newY = window['movingObject'].offsetTop - yMove;
    window['movingObject'].style.left = newX + 'px';
    window['movingObject'].style.top = newY + 'px'
};

function addClassToElement(element, className) {
    element.className = element.className ? element.className + ' ' + className : className
};

function removeClassFromElement(element, className) {
    if (element.className == className) element.className = null;
    else element.className = element.className.replace(' ' + className, '')
};
