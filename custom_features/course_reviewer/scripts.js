const emoji = [
    // '&#128546;',
    // '&#128528;',
    // '&#128512;',
    '🥉',
    '🥈',
    '🥇'
]

const bloomsColors = {
    'remember': '#F56E74',
    'understand': '#FEB06E',
    'apply': '#FEE06E',
    'analyze': '#B1D983',
    'evaluate': '#88C1E6',
    'create': '#A380C4',
    'n/a': '#C4C4C4'
}
function genBloomsChart(data) {
    // Set dimensions and radius
    const width = 150;
    const height = 150;
    const radius = Math.min(width, height) / 2;

    // Create an arc generator
    const arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    // Create a label arc generator
    const labelArc = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    // Create a pie generator
    const pie = d3.pie()
        .sort(null)
        .value(d => d[1]);

    // Select the SVG element and set its dimensions
    const svg = d3.select("svg.blooms-chart")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    // Bind data to the pie chart
    const g = svg.selectAll(".arc")
        .data(pie(Object.entries(data)))
        .enter().append("g")
        .attr("class", "arc");

    // Append path elements for each slice
    g.append("path")
        .attr("d", arc)
        .style("stroke", "white")
        .style("fill", d => bloomsColors[d.data[0]]);

    // Create key for colors
    const key = d3.select(".blooms-chart-key");
    Object.entries(bloomsColors).forEach(([label, color]) => {
        key.append("div")
            .attr("class", "key-item")
            .style("display", "flex")
            .style("align-items", "center")
            .style("line-height", "1rem")
            .style("margin-bottom", "2px")
            .html(`<div class="key-color" style="background-color: ${color}; width: 1rem; height: 1rem; margin-right: 1rem; display: inline-block;"></div><div style="display: inline-block;">${label}</div>`);
    });
}

function calcQuizScore(quiz) {
    let quizScore = Math.floor(((
        (quiz.clarity) // 0-2
        + (quiz.chunked_content ? 1 : 0)
        + (quiz.includes_outcomes ? 1 : 0)
        + (quiz.career_relevance ? 1 : 0)
        + (quiz.instructions ? 1 : 0)
        + (quiz.preparation ? 1 : 0)
        + (quiz.provides_feedback ? 1 : 0)
        + (quiz.objectives > 0 ? 1 : 0)
        ) / 8) // divide by total points
    * 3) - 1; // multiply by 3 so we can then round it and get a 0 = sad, 1 = mid, 2+ = happy
    if (quizScore > 2) quizScore = 2;
    if (quizScore < 0) quizScore = 0;
    return quizScore;
}

function calcAssignmentScore(assignment) {
    let assignmentScore = Math.floor(((
        (assignment.clarity - 1) // 1-3, so -1 to get to 0-2
        + (assignment.chunked_content ? 1 : 0)
        + (assignment.includes_outcomes ? 1 : 0)
        + (assignment.career_relevance ? 1 : 0)
        + (assignment.objectives > 0 ? 1 : 0)
        + (assignment.provides_feedback > 0 ? 1 : 0)
        + (assignment.modeling > 0 ? 1 : 0)
        ) / 8) // divide by total points
    * 3) - 1; // multiply by 3 so we can then round it and get a 0 = sad, 1 = mid, 2+ = happy
    if (assignmentScore > 2) assignmentScore = 2;
    if (assignmentScore < 0) assignmentScore = 0;
    return assignmentScore;
}

function calcPageSCore(page) {
    let pageScore = Math.floor(((
        (page.clarity - 1) // 1-3, so -1 to get to 0-2
        + (page.chunked_content ? 1 : 0)
        + (page.includes_outcomes ? 1 : 0)
        + (page.career_relevance ? 1 : 0)
        + (page.supporting_media ? 1 : 0)
        ) / 6) // divide by total points
    * 3) - 1; // multiply by 3 so we can then round it and get a 0 = sad, 1 = mid, 2+ = happy
    if (pageScore > 2) pageScore = 2;
    if (pageScore < 0) pageScore = 0;
    return pageScore;
}

function addTopics(counts, dataList) {
    for (let i in dataList) {
        let data = dataList[i];
        // topic tags
        if (data.topic_tags) {
            for (let t in data?.topic_tags ?? []) {
                let tag = data.topic_tags[t];
                if (counts?.[tag] === undefined) counts[tag] = 0;
                counts[tag]  += 1;
            }
        }
    }
    return counts;
}

function addObjectives(counts, dataList) {
    for (let i in dataList) {
        let data = dataList[i];
        // objectives 
        if (counts['n/a/'] == undefined) counts['n/a'] = 0;
        if ((data?.objectives ?? []).length > 0) {
            for (let o in data?.objectives?? []) {
                let objective = data.objectives[o];
                if (counts?.[objective] === undefined) counts[objective] = 0;
                counts[objective]  += 1;
            }
        } else {
            counts['n/a/'] += 1;
        }
    }
    return counts;
}