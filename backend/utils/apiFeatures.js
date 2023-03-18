const { json } = require('express');

class ApiFeatures {
  constructor(query, queryString) {
    // constructor will automatically return an object of ApiFeatures class
    this.query = query;
    this.queryString = queryString;

    // console.log('from apiFeatures', queryString);
  }

  search() {
    // for search
    const keyword = this.queryString.keyword
      ? {
          name: {
            $regex: this.queryString.keyword,
            $options: 'i', // case insensitive search
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });

    // to support method chaining on seach()
    return this;
  }

  filter() {
    const queryStringCopy = { ...this.queryString };

    // for category - removing some fileds for categroy
    const removeFields = ['keyword', 'page', 'limit'];
    removeFields.forEach((key) => delete queryStringCopy[key]);

    // for price - replacing gt with $gt
    let queryStr = JSON.stringify(queryStringCopy);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (key) => `$${key}`);

    this.query = this.query.find({ ...JSON.parse(queryStr) });

    // to support method chaining on filter()
    return this;
  }

  pagination(resultPerPage) {
    const currentPage = +this.queryString.page || 1;
    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.skip(skip).limit(resultPerPage);

    // to support method chaining on filter()
    return this;
  }
}

module.exports = ApiFeatures;
