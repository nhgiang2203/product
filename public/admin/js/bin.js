//Restore product
const restoreProduct = document.querySelectorAll('[button-restore]');

if (restoreProduct.length > 0) {
    const formRestore = document.querySelector('#form-restore-item');

    const path = formRestore.getAttribute('data-path');
    console.log(path);

    restoreProduct.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            console.log(id);

            const action = `${path}/${id}?_method=PATCH`;
            console.log(action);

            formRestore.action = action;
            formRestore.submit();
        });
    })
}

//Delete Product
const buttonDelete = document.querySelectorAll('[button-delete');
if (buttonDelete.length > 0) {
    const formDelete = document.querySelector('#form-delete-item');
    const path = formDelete.getAttribute('data-path');

    buttonDelete.forEach(button => {
        button.addEventListener('click', () => {
            const isConfirm = confirm('Bạn có chắc chắn muốn xóa vĩnh viễn ?');
            if (isConfirm){
                const id = button.getAttribute('data-id');

                const action = `${path}/${id}?_method=DELETE`;
                formDelete.action = action;
                formDelete.submit();
            }
            
        });
    })
}