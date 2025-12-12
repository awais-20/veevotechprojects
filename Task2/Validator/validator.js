const joi = require('joi');
const moment = require('moment');

const Uservalidator = joi.object({
    name: joi.string().min(3).max(25).required().messages({
        'string.empty': "Name should not be empty",
        'string.min': 'Name should be at least 3 characters',
        'string.max': "Name should not be more than 25 characters",
        'any.required': 'Name is required'
    }),
    email: joi.string()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|pk|fr)$/)
    .required()
    .messages({
        'string.pattern.base': 'Email must end with a valid domain (.com, .org, .net, .pk, .fr)',
        'any.required': 'Email is required'
    }),

    password: joi.string().min(6).required().messages({
        'string.min': 'Password should have at least 6 characters',
        'any.required': 'Password is required',
    }),
    mobile: joi.string().pattern(/^\+92\d{10}$/).required().messages({
        'string.pattern.base': 'Mobile number is not valid. Format must be +923034560132',
        'any.required': 'Mobile number is required',
    }),
    dob: joi.string().custom((value, helpers) => {
        const date = moment(value, "DD/MM/YYYY", true);
        if (!date.isValid()) {
            return helpers.error("any.invalid");
        }
        return date.toDate();
    }).required().messages({
        'any.required': 'Date of Birth is required',
        'any.invalid': 'Date of Birth should have this format: DD/MM/YYYY'
    }),
    template: joi.number().optional(),
    gender: joi.string().valid("Male", "Female", "Other").default("Male"),
    photo: joi.object({
        url: joi.string().uri()
    })
});


const loginValidator = joi.object({
     email:joi.string()
     .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|pk|fr)$/)
     .required()
     .messages({
        'string.pattern.base': 'Email Must be Vaild and end with valid domain'
     }),

     password: joi.string()
     .required()
     .messages({
        'string.required': 'Password is required'
     })

})
module.exports = { Uservalidator, loginValidator };
