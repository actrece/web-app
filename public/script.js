document.addEventListener("DOMContentLoaded", () => {
    const breedForm = document.getElementById("breed-form");
    const breedTableBody = document.querySelector("#breed-table tbody");

    // Event listener for form submission
    breedForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Prevent form submission reload

        // Get form values
        const breedName = document.getElementById("breed-name").value;
        const description = document.getElementById("description").value;
        const origin = document.getElementById("origin").value;

        // Add a new row to the table
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${breedName}</td>
            <td>${description}</td>
            <td>${origin}</td>
        `;
        breedTableBody.appendChild(row);

        // Clear the form inputs
        breedForm.reset();
    });
});
