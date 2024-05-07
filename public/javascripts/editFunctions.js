const formsToSubmit = document.querySelectorAll('#updateForm')
const submitForms = () => {
    formsToSubmit.forEach(form => form.submit())
}