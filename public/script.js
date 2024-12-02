document.addEventListener('DOMContentLoaded', () => {
    const breedList = document.getElementById('breed-list');
    const addBreedButton = document.getElementById('add-breed-button');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');
    const breedForm = document.getElementById('breed-form');

    // Fetch breeds and display them
    const fetchBreeds = async () => {
        try {
            const response = await fetch('/breeds');
            const breeds = await response.json();
            breedList.innerHTML = ''; // Clear the list
            breeds.forEach(breed => {
                const breedCard = document.createElement('div');
                breedCard.classList.add('breed-card');
                breedCard.innerHTML = `
                    <h3>${breed.name}</h3>
                    <p>${breed.description}</p>
                `;
                breedList.appendChild(breedCard);
            });
        } catch (error) {
            console.error('Error fetching breeds:', error);
        }
    };

    // Show modal for adding/editing breeds
    addBreedButton.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Handle breed form submission
    breedForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(breedForm);
        const breedData = {
            name: formData.get('name'),
            description: formData.get('description'),
            origin: formData.get('origin'),
            image_url: formData.get('image-url')
        };

        try {
            const response = await fetch('/breeds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(breedData)
            });
            if (response.ok) {
                fetchBreeds();
                modal.classList.add('hidden');
            } else {
                console.error('Error adding breed:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Initial fetch
    fetchBreeds();
});
