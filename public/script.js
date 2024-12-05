document.addEventListener("DOMContentLoaded", () => {
    const breedForm = document.getElementById("breed-form");
    const breedTableBody = document.querySelector("#breed-table tbody");
    let breedIdCounter = 1;  // This will track the ID for each new breed.

    // Event listener for form submission
    breedForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Prevent form submission reload

        // Get form values
        const breedName = document.getElementById("breed-name").value;
        const description = document.getElementById("description").value;
        const origin = document.getElementById("origin").value;

        // Check if values are not empty
        if (!breedName || !description || !origin) {
            alert("Please fill out all fields.");
            return;
        }

        // Create a new row with an ID, breed name, description, origin, and action buttons
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${breedIdCounter++}</td>
            <td>${breedName}</td>
            <td>${description}</td>
            <td>${origin}</td>
            <td>
                <button class="update-btn">Update</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;

        // Add the new row to the table
        breedTableBody.appendChild(row);

        // Add event listeners for delete and update buttons
        const deleteBtn = row.querySelector(".delete-btn");
        const updateBtn = row.querySelector(".update-btn");

        // Delete functionality: Remove row from the table
        deleteBtn.addEventListener("click", () => {
            breedTableBody.removeChild(row);  // Remove the row from the table
        });

        // Update functionality: Pre-fill the form with the current data for updating
        updateBtn.addEventListener("click", () => {
            document.getElementById("breed-name").value = breedName;
            document.getElementById("description").value = description;
            document.getElementById("origin").value = origin;

            // Remove the breed entry from the table (we will update it once saved)
            breedTableBody.removeChild(row);
        });

        // Clear the form inputs
        breedForm.reset();
    });
});
