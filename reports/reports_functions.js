const month_name = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

var s = document.createElement("script");
s.type = "text/javascript";
s.src = "https://kryogenix.org/code/browser/sorttable/sorttable.js";
$("head").append(s);

function createReport() {
	$('div#application').append("<div id='btech-modal' class='btech-modal'></div>");
	$('#btech-modal').append("<div class='btech-modal-content' id='btech-modal-content'></div>");
	$('#btech-modal-content').append("<span class='btech-close' id='btech-close'>&times;</span>");
	$('#btech-modal-content').append("<h3 style='text-align: center;'>Report</h3>");
	$('#btech-modal-content').append("<h5 style='text-align: center;'>Click on column headers to sort by that column.</h5>");
	$('#btech-modal-content').append("<h5 style='text-align: center;'>Hover over column headers for a description of the information displayed in that column.</h5>");
  $('#btech-modal-content').append("<div style='display: none;' id='btech-report-options'></div>");
	$('#btech-modal-content').append("<table class='sortable' border='1' id='btech-report-table'></table>");
	$('#btech-report-table').append("<tbody border='1' id='btech-report-table-body'></tbody>");
	$('#btech-report-table').append("<thead border='1' id='btech-report-table-head'></thead>");
	$('#btech-report-table').append("<tfoot border='1' id='btech-report-table-foot'></tfoot>");
	$('#btech-close').click(function() {
	    let modal = $('div#btech-modal');
	    modal.hide();
	});
  let report_head = $('#btech-report-table-head');
  let header_row = createHeaderRow();
  header_row.appendTo(report_head);
}

function keyToHeading(key) {
    return key.replace(/_/g, " ").toUpperCase();
}

function keyToCSS(key) {
    return key.replace(/_/g, "-");
}

function median(values) {
	if(values.length ===0) return 0;
	values.sort(function(a,b){
	    return a-b;
	});
	var half = Math.floor(values.length / 2);
	if (values.length % 2)
	    return values[half];
	return (values[half - 1] + values[half]) / 2.0;
};

function getCellId(key, user_id) {
	return "btech-report-"+keyToCSS(key)+"-"+user_id
}

function createHeaderRow() {
	let row = $('<tr></tr>');
	let count = 0;
	for (let key in columns) {
		let sortable_type = columns[key].sortable_type;
		let description = columns[key].description;
		row.append("<th title='"+description+"' class='"+getCellId(key, "class") +" "+sortable_type+"'style='text-align:center; padding:10px;'>"+key.replace(/_/g, " ").toUpperCase()+"</th>");
		count += 1;
	}
	return row;
}

function updateAverage(key, dict) {
	let total = 0;
	let count = 0;
	for (let id in dict) {
		let element = dict[id];
		let val = element[key];
		if (!isNaN(parseInt(val))) {
			total += parseInt(val);
			count += 1;
		}
	}
	let average = total / count;
	let text = Math.round(average);
	if (columns[key].percent === true) text += "%";
	columns[key].average_element.html(text);
}
window.onclick = function(event) {
  let modal = $('div#btech-modal');
  if (event.target == modal) {
      modal.hide();
  }
}

function updateMedian(key, dict) {
  let vals  = [];
  for (let id in dict) {
		let element = dict[id];
		let val = element[key];
    vals.push(val);
  }
	let med = median(vals)
	let text = Math.floor(med);
	if (columns[key].percent === true) text += "%";
	columns[key].median_element.html(text);
}

function toggleColumnHidden() {
  for (let key in columns) {
    let checkBox = $('#'+getCellId(key, "check-box"));
    if (checkBox.prop("checked") === false) {
      columns[key].hidden = true;
      $('.'+getCellId(key, "class")).hide();
    } else {
      columns[key].hidden = false;
      $('.'+getCellId(key, "class")).show();
    }
  }
}
