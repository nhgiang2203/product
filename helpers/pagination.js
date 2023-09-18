module.exports = (objectPagination, query, countProducts) => {
    
    if (query.page){
        objectPagination.currentPage = parseInt(query.page);
    }

    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitedItems;

    const totalPage = Math.ceil(countProducts / objectPagination.limitedItems);
    objectPagination.totalPage = totalPage;

    return objectPagination;

}