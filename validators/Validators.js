const Joi = require("joi");

class Validators {
  signupValidator(req, res, next) {
    try {
      const schema = Joi.object({
        name: Joi.string().min(3).max(25).required(),
        email: Joi.string().required(),
        password: Joi.string().min(4).max(20).required(),
        confirmPassword: Joi.string()
          .min(4)
          .max(20)
          .required()
          .equal(Joi.ref("password")),
      });

      const value = schema.validate(req.body);
      if (value.error) {
        res.status(400).json({ message: value.error.message });
      } else {
        next();
      }
    } catch (error) {
      console.log("error while validating signup", error);
      res.status(500).send("Something went wrong!");
    }
  }
}

module.exports = new Validators();
