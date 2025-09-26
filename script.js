let excelData = [];

function showStatus(msg, type="info") {
  const status = document.getElementById('status');
  status.textContent = msg;
  status.className = 'status-message alert alert-' + (type === "error" ? "danger" : (type === "success" ? "success" : "primary")) + " py-2";
}

document.getElementById('processBtn').onclick = function() {
  excelData = [];
  document.getElementById("tablePreview").innerHTML = "";
  let fileInput = document.getElementById("jsonFile");
  let file = fileInput.files[0];
  if(!file) return showStatus("Сначала выберите JSON-файл.", "error");
  showStatus("Загружаю и обрабатываю файл...", "info");
  let reader = new FileReader();
  reader.onload = function(e) {
    try {
      let data = JSON.parse(e.target.result);
      let units = Array.isArray(data.aggregationUnits) ? data.aggregationUnits : [];
      units.forEach(unit => {
        if(unit.unitSerialNumber && Array.isArray(unit.sntins)) {
          unit.sntins.forEach(sntin => {
            excelData.push({
              "Unit Serial Number": unit.unitSerialNumber,
              "SNTIN": sntin
            });
          });
        }
      });
      if (excelData.length === 0) {
        showStatus("Unit Serial Number или SNTIN-коды не найдены.", "error");
        document.getElementById("tableContainer").style.display = "none";
      } else {
        showStatus(`Обработано строк: ${excelData.length}`, "success");
        displayUnitNumbersInTable(excelData);
        document.getElementById("tableContainer").style.display = "block";
        document.getElementById("downloadBtn").disabled = false;
      }
    } catch(err) {
      showStatus("Ошибка при чтении JSON: " + err.message, "error");
    }
  };
  reader.readAsText(file);
};

function displayUnitNumbersInTable(data) {
  let tableHtml = `<table class="table table-bordered table-hover align-middle mb-0"><thead><tr>
    <th>Unit Serial Number</th>
    <th>SNTIN</th>
  </tr></thead><tbody>`;
  data.forEach(row => {
    tableHtml += `<tr>
      <td>${row["Unit Serial Number"]}</td>
      <td>${row["SNTIN"]}</td>
    </tr>`;
  });
  tableHtml += "</tbody></table>";
  document.getElementById("tablePreview").innerHTML = tableHtml;
}

// Поиск по таблице
document.getElementById("searchInput").addEventListener("input", function() {
  let q = this.value.trim().toLowerCase();
  let filtered = excelData.filter(row =>
    row["Unit Serial Number"].toLowerCase().includes(q) ||
    row["SNTIN"].toLowerCase().includes(q)
  );
  displayUnitNumbersInTable(filtered.length ? filtered : excelData);
});

document.getElementById('downloadBtn').onclick = function() {
  if (!excelData.length) return showStatus("Нет данных для выгрузки.", "error");
  let ws = XLSX.utils.json_to_sheet(excelData);
  let wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "SNTINS Codes");
  XLSX.writeFile(wb, "sntins_codes.xlsx");
  showStatus("Excel успешно сохранён!", "success");
};