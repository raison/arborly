var arborly = arborly || {};
arborly.startNode = 1;
$(document).mousemove(function(e) {
    arborly.x = e.pageX;
    arborly.y = e.pageY;
});
arborly.showEdit = function(d) {
    $("#editform").remove();
    var $formElem = $("#form-template").clone();
    $formElem.attr("id", "editform");
    $("body").append($formElem);
    $("#editform .controlpanel").hide();
    $("#editform .controlpanel.editNode").show();
    $("#editform").css({
        "top": arborly.y + 20 + "px",
        "left": arborly.x + "px"
    });
    $("#editform").fadeIn("slow");
    $('#editform .editname').editable({
        type: 'text',
        pk: d.id,
        name: "name",
        url: '/api/edit',
        title: 'Name',
        value: d.name,
        success: function(data) {
            arborly.updateNode(data);
        },
        error: function(data) {}
    });
    $('#editform .editjobtitle').editable({
        type: 'text',
        pk: d.id,
        name: "jobtitle",
        url: '/api/edit',
        title: 'Job Title',
        value: d.jobtitle,
        success: function(data) {
            arborly.updateNode(data);
        },
        error: function(data) {}
    });

    $("#editform").on("mouseleave", function(e) {
        $(this).fadeOut("slow", function() {
            $("#editform").remove();
        });

    });
    $("#editform .close").on("click", function(e) {
        e.preventDefault();
        $("#editform").fadeOut("slow", function() {
            $("#editform").remove();
        });

    });
    $(".node-edit button").on("click", function(e) {
        e.preventDefault();
        var method = $(this).attr("data-method");
        $("#editform .node-edit button").removeClass("active");
        $(this).addClass("active");
        $(".controlpanel").hide();
        $("#editform ." + method + "Node").show();
        if (method == "show") {
            arborly.editNode({
                id: d.id
            }, "show");
        }
    });
    $(".create-node").on("click", function(e) {
        e.preventDefault();
        var newName = $(this).parent().parent().find("input[name=newname]").val();
        var newTitle = $(this).parent().parent().find("input[name=newtitle]").val();
        if (newTitle != "" && newName != "") {
            arborly.editNode({
                "name": newName,
                "jobtitle": newTitle,
                "id": d.id
            }, "add");
        }
    });

    $(".sort-node").on("click", function(e) {
        e.preventDefault();
        arborly.editNode({
            "id": d.id,
            "sort": $(this).attr("data-sort")
        }, "list");
    });
}
arborly.editNode = function(data, method) {
    if (method == "add") {
        $.post("/api/add", {
                name: data.name,
                jobtitle: data.jobtitle,
                parent: data.id
            })
            .done(function(data) {
                doTree(arborly.startNode);
            });
    }
    if (method == "show") {
        arborly.startNode = data.id;
        if (arborly.startNode > 1) {
            $("#start-node").html('Viewing tree from node ' + arborly.startNode + '. <button type="button" class="btn btn-info reset-tree">reset to root</button>');
            $(".reset-tree").unbind("click");
            $(".reset-tree").on("click", function() {
                doTree(1);
                $("#start-node").html('Viewing tree from root node.');
            });
        } else {
            doTree(1);
            $("#start-node").html('Viewing tree from root node.');
        }
        doTree(arborly.startNode);

    }
    if (method == "list") {
        $.get("/api/list/" + data.id + "/" + data.sort)
            .done(function(data) {
                var html = '<table class="table table-striped table-bordered table-condensed"><thead><tr><th>Name</th><th>Job Title</th></tr></thead><tbody>';
                for (var i = 0; i < data.length; i++) {
                    html += "<tr><td>" + data[i][0] + "</td><td>" + data[i][1] + "</td></tr>";
                }
                html += "</tbody></table>";
                $("#editform .sorted-list").html(html);
            });
    }
}
arborly.updateNode = function(data) {
    var newText = data[0].name + " - " + data[0].jobtitle;
    $("text[id=" + data[0].person_id + "]").text(newText)
}

var margin = {
        top: 20,
        right: 120,
        bottom: 20,
        left: 120
    },
    width = 960 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;

var i = 0,
    duration = 750,
    root;

var tree = d3.layout.tree()
    .size([height, width]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) {
        return [d.y, d.x];
    });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var doTree = function(startNode) {
    d3.json("/api/tree/" + startNode, function(error, flare) {
        root = flare;
        root.x0 = height / 2;
        root.y0 = 0;

        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        //root.children.forEach(collapse);
        update(root);
    });
}
doTree(0);
d3.select(self.frameElement).style("height", "800px");

function update(source) {
    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) {
        d.y = d.depth * 180;
    });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) {
            return d.id || (d.id = ++i);
        });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on("click", click)
        .on("mouseover", hover)

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function(d) {
            return d._children ? "lightsteelblue" : "#fff";
        });

    nodeEnter.append("text")
        .attr("x", function(d) {
            return d.children || d._children ? -10 : 10;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) {
            return d.children || d._children ? "end" : "start";
        })
        .attr("id", function(d) {
            return d.id;
        })
        .text(function(d) {
            return d.name + " - " + d.jobtitle;
        })
        .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")";
        });

    nodeUpdate.select("circle")
        .attr("r", 4.5)
        .style("fill", function(d) {
            return d._children ? "lightsteelblue" : "#fff";
        });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) {
            return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d) {
            return d.target.id;
        });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
            var o = {
                x: source.x0,
                y: source.y0
            };
            return diagonal({
                source: o,
                target: o
            });
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
            var o = {
                x: source.x,
                y: source.y
            };
            return diagonal({
                source: o,
                target: o
            });
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// Toggle children on click.
function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update(d);
}

function openAll() {
    svg.selectAll("g.node").data(nodes, function(d) {
        d.children = d._children;
        d._children = null;
        update(d);
    });
}

function hover(d) {
    arborly.showEdit(d);
}