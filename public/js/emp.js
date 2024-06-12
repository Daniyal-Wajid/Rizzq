document.addEventListener('DOMContentLoaded', () => {
    const jobManagement = document.querySelector('.job-management');

    jobManagement.addEventListener('click', (e) => {
        const jobCard = e.target.closest('.job-card');
        const jobId = jobCard.dataset.id;

        if (e.target.classList.contains('update-btn')) {
            // Redirect to the edit page
            window.location.href = `/jobs/${jobId}/edit`;
        }

        if (e.target.classList.contains('delete-btn')) {
            fetch(`/jobs/${jobId}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (response.ok) {
                    jobCard.remove();
                } else {
                    console.error('Failed to delete job');
                }
            })
            .catch(error => console.error('Error:', error));
        }
    });
});
