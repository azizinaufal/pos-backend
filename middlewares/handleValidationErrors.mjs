import {validationResult} from 'express-validator';

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).json({
           meta: {
               success: false,
               message: 'Proses Validasi Eror'
           },
            errors: errors.array(),
        });
    }
    next();
};

export {handleValidationErrors};