<script>
  const ctx = document.getElementById('myChart').getContext('2d');
  new Chart(ctx, {
    "type": "scatter",
    "data": {
      "datasets": [
        {
          "label": "روابط مدل",
          "data": [
            { "x": 0, "y": 0, "r": 10, "label": "دینداری مالی" },
            { "x": 2, "y": 0, "r": 10, "label": "رفتار مالی" },
            { "x": 4, "y": 0, "r": 10, "label": "سواد مالی" },
            { "x": 1, "y": -2, "r": 10, "label": "رفاه مالی" },
            { "x": 3, "y": -2, "r": 10, "label": "اثر تعدیل‌گر" }
          ],
          "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
          "pointStyle": "circle",
          "pointRadius": 10
        },
        {
          "label": "روابط",
          "data": [
            { "x": 0, "y": 0, "x2": 1, "y2": -2, "label": "0.1248" },
            { "x": 2, "y": 0, "x2": 1, "y2": -2, "label": "0.3778" },
            { "x": 4, "y": 0, "x2": 1, "y2": -2, "label": "0.2429" },
            { "x": 3, "y": -2, "x2": 1, "y2": -2, "label": "0.0162" },
            { "x": 0, "y": 0, "x2": 2, "y2": 0, "label": "0.2772" },
            { "x": 4, "y": 0, "x2": 2, "y2": 0, "label": "0.7209" },
            { "x": 4, "y": 0, "x2": 3, "y2": -2, "label": "0.9999" }
          ],
          "type": "line",
          "borderColor": ["#FF6384", "#36A2EB", "#FFCE56", "#9966FF", "#FF6384", "#FFCE56", "#9966FF"],
          "borderWidth": 2,
          "pointRadius": 0,
          "showLine": true
        }
      ]
    },
    "options": {
      "scales": {
        "x": { "display": false },
        "y": { "display": false }
      },
      "plugins": {
        "legend": { "display": false },
        "tooltip": {
          "callbacks": {
            "label": function(context) {
              return context.dataset.label + ": " + context.raw.label;
            }
          }
        },
        "annotation": {
          "annotations": [
            { "type": "label", "xValue": 0, "yValue": 0, "content": "دینداری مالی", "color": "#FF6384" },
            { "type": "label", "xValue": 2, "yValue": 0, "content": "رفتار مالی", "color": "#36A2EB" },
            { "type": "label", "xValue": 4, "yValue": 0, "content": "سواد مالی", "color": "#FFCE56" },
            { "type": "label", "xValue": 1, "yValue": -2, "content": "رفاه مالی", "color": "#4BC0C0" },
            { "type": "label", "xValue": 3, "yValue": -2, "content": "اثر تعدیل‌گر", "color": "#9966FF" }
          ]
        }
      }
    }
  });
</script>
