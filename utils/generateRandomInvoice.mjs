function randomInvoice(prefix = 'INV'){
    const timestamp = Date.now();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `${prefix}-${timestamp}-${randomNum}`;
    return invoiceNumber;
}


export {randomInvoice};