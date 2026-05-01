// Frontend action handling: file uploads
const csvInput = document.createElement("input");
csvInput.type = "file";
csvInput.accept = ".csv,text/csv";
csvInput.hidden = true;
document.body.appendChild(csvInput);

let uploadMode = "";

document.addEventListener("click", (event) => {
  const importButton = event.target.closest(
    "#import-evacuees, #change-scenario, #change-evacuation-points",
  );
  if (importButton) {
    uploadMode = importButton.id;
    csvInput.click();
  }
});

csvInput.addEventListener("change", async () => {
  const file = csvInput.files?.[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".csv")) {
    alert("File harus CSV");
    csvInput.value = "";
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", uploadMode);

  try {
    const response = await fetch("http://localhost:5000/upload-csv", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload gagal");
    }

    alert("CSV berhasil dikirim ke backend");
  } catch (error) {
    console.error(error);
    alert("Gagal upload CSV");
  } finally {
    csvInput.value = "";
    uploadMode = "";
  }
});
