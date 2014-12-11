
var ctx = document.getElementById("myChart").getContext("2d");
var data = {
    labels: ["Troie", "Puttane", "Lozze", "Tette", "Pelo", "Bordelli", "Vacche"],
    datasets: [
        {
            label: "My First dataset",
            fillColor: "rgba(220,220,220,0.5)",
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "rgba(220,220,220,0.75)",
            highlightStroke: "rgba(220,220,220,1)",
            data: [69, 69, 0, 99, 50, 56, 0]
        },
        {
            label: "My Second dataset",
            fillColor: "rgba(151,187,205,0.5)",
            strokeColor: "rgba(151,187,205,0.8)",
            highlightFill: "rgba(151,187,205,0.75)",
            highlightStroke: "rgba(151,187,205,1)",
            data: [69, 12, 2, 100, 30, 5, 2]
        }
    ]
};
var myBarChart = new Chart(ctx).Bar(data, {});