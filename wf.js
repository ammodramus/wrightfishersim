var N = 30, numGens = 30;


function runifd(a,b){
   var x = Math.floor(a+(b-a+1)*Math.random());
   return x;
}


var theta = 1.0;
var mu = theta / (2.0 * N);

var relationships = [];
var genotypes = [];
genotypes.push([]);
for (var j = 0; j < N; j++){
    var mut = Math.random() <= mu;
    if (mut){
        genotypes[0][j] = 1;
    }
    else
        genotypes[0][j] = 0;
}
for (var t = 0; t < numGens; t++){
    relationships[t] = [];
    if(t != 0)
        genotypes[t] = [];
    for (var j = 0; j < N; j++){
        relationships[t][j] = runifd(0,N-1);
        if (t == 0){
            continue;
        }
        var mut = Math.random() <= mu;
        if (mut){
            genotypes[t][j] = (genotypes[t-1][relationships[t][j]] == 1)?0:1;
        }
        else {
            genotypes[t][j] = genotypes[t-1][relationships[t][j]];
        }
    }
}

// initial "selected" behavior
selected = [];
for(var j = 0; j < N; j++){
    selected[j] = false;
}

positions = [];
for(t = 0; t < numGens; t++){
    for(j = 0; j < N; j++){
        positions.push({j: j, t: t});
    }
}

var width = 600;
var padding = 100;
var imgWidth = width-padding;

var interCircle = imgWidth / N;
var circleToSpaceRatioX = 0.5;
var circleToSpaceRatioY = 1.0;
var radius = Math.floor(circleToSpaceRatioX * interCircle) / 2.0;
var height = interCircle*numGens * circleToSpaceRatioY/circleToSpaceRatioX;


var xscaler = d3.scale.linear()
    .domain([0,N])
    .rangeRound([padding,width-padding]);

var yscaler = d3.scale.linear()
    .domain([0,numGens])
    .rangeRound([padding,height-padding]);

var svg = d3.select("body").select("#wf")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var ancestralColor = "#FA8B60";
var derivedColor = "#603F8D";

var lineColor = "#BCBCBC";

function get_lines(selected){
    lines = []
    for (var j = 0; j < N; j++)
    {
        if (selected[j] == true){
            var curIndiv = j;
            for(var t = numGens-1; t > 0; t--){
                lines.push({t0: t, t1: t-1, j0: curIndiv, j1: relationships[t][curIndiv]});
                curIndiv = relationships[t][curIndiv];
            }
        }
    }
    return lines;
}

selectedLines = [];

function redraw(){
    svg.selectAll("circle").remove();
    svg.selectAll("line").remove();
    lineSel = svg.selectAll("line")
        .data(selectedLines);
    lineSel.enter()
        .append("line")
        .attr("x1", function(d) { return xscaler(d.j0) })
        .attr("x2", function(d) { return xscaler(d.j1) })
        .attr("y1", function(d) { return yscaler(d.t0) })
        .attr("y2", function(d) { return yscaler(d.t1) })
        .attr("stroke-width", "2px")
        .attr("stroke", lineColor);
    svg.selectAll("circle")
        .data(positions)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return xscaler(d.j) })
        .attr("cy", function(d) { return yscaler(d.t) })
        .attr("r", radius)
        .attr("fill", function(d) { if (genotypes[d.t][d.j] == 1) return derivedColor; else return ancestralColor })
        .attr("stroke", function(d) { if (selected[d.j] == true && d.t == numGens-1) return lineColor; else return "none" })
        .attr("stroke-width", function(d) { if (selected[d.j] == true && d.t == numGens-1) return "3px"; else return "none" })
        .on("click", function(d) { 
            // can only select present-day individuals...
            if (d.t != numGens-1)
               return; 
            curSel = selected[d.j];
            if (curSel == false){
                selected[d.j] = true;
                d3.select(this).attr("stroke", "black");
                d3.select(this).attr("stroke-width", "3px");
            }
            else {
                selected[d.j] = false;
                d3.select(this).attr("stroke", "none");
            }
            selectedLines = get_lines(selected);
            redraw();
            return;
            });
}
redraw();

var yAxisScaler = d3.scale.linear()
    .domain([0,numGens-1])
    .rangeRound([yscaler(numGens-1), yscaler(0)]);

yAxis = d3.svg.axis()
    .scale(yAxisScaler)
    .orient("left");

svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (padding-15) + ", 0)")
    .call(yAxis);

var yaxisLabelX = xscaler(0)-60;
var yaxisLabelY = yscaler(numGens/2);

svg.append("text")
    .attr("x", yaxisLabelX)
    .attr("y", yaxisLabelY)
    .attr("text-anchor", "center")
    .attr("transform", "rotate(-90," + yaxisLabelX + ", " + yscaler(numGens/2) + ")")
    .attr("font-size", "16pt")
    .text("Generations ago");

