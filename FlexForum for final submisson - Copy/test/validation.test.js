import { expect } from 'chai';
import { isValidEmail } from '../test/validation.js';
import { displayUsers } from '../test/validation.js'; // Update the path as necessary
import { getNextBlogIndex, createBlogHtml } from '../test/validation.js';
import { isValidPhoneNumber } from '../test/validation.js';
import { JSDOM } from 'jsdom';
import jquery from 'jquery';



describe('Email Validation', function () {
  it('should return true for valid email addresses', function () {
    const validEmails = ['email@example.com', 'firstname.lastname@example.com', 'email@subdomain.example.com'];
    validEmails.forEach((email) => {
      expect(isValidEmail(email)).to.be.true;
    });
  });

  it('should return false for invalid email addresses', function () {
    const invalidEmails = ['', 'plainaddress', '@missingusername.com', 'invalid@domain', 'missingatsign', 'missingdomain@.com'];
    invalidEmails.forEach((email) => {
      expect(isValidEmail(email)).to.be.false;
    });
  });
});

describe('Blog Utilities', function () {
  describe('getNextBlogIndex', function () {
    it('should return 0 if current index is the last index', function () {
      const result = getNextBlogIndex(4, 5);
      expect(result).to.equal(0);
    });

    it('should return next index if current index is not the last index', function () {
      const result = getNextBlogIndex(0, 5);
      expect(result).to.equal(1);
    });
  });

  describe('createBlogHtml', function () {
    it('should return a string of HTML for the blog', function () {
      const blog = {
        username: 'testuser',
        date: '2021-01-01T00:00:00Z',
        text: 'Test blog content'
      };
      const result = createBlogHtml(blog);
      expect(result).to.contain(blog.username);
      expect(result).to.contain(blog.text);
      expect(result).to.contain('2021');
    });
  });
});

const { window } = new JSDOM('<!DOCTYPE html><html><body><div id="user-list"></div></body></html>');
const $ = jquery(window);


global.$ = $;

describe('displayUsers', function () {
  it('should correctly display user entries in the DOM', function () {
    // Given
    const users = [
      { username: 'user1', email: 'user1@example.com', isFollowed: false },
      { username: 'user2', email: 'user2@example.com', isFollowed: true }
    ];

    // When
    displayUsers(users);

    // Then
    const userEntries = $('#user-list p');
    expect(userEntries).to.have.lengthOf(2);
    expect(userEntries.eq(0).find('button').hasClass('follow-btn')).to.be.true;
    expect(userEntries.eq(0).find('button').text()).to.equal('Follow');
    expect(userEntries.eq(1).find('button').hasClass('followed')).to.be.true;
    expect(userEntries.eq(1).find('button').text()).to.equal('Following');
  });
});


describe('isValidPhoneNumber', () => {
  it('should return true for valid phone numbers', () => {
    // Valid phone numbers
    expect(isValidPhoneNumber('1234567890')).to.be.true;
    expect(isValidPhoneNumber('9876543210')).to.be.true;
  });

  it('should return false for invalid phone numbers', () => {
    // Invalid phone numbers
    expect(isValidPhoneNumber('12345')).to.be.false; // Less than 10 digits
    expect(isValidPhoneNumber('12345678901')).to.be.false; // More than 10 digits
    expect(isValidPhoneNumber('abc1234567')).to.be.false; // Contains non-numeric characters
    expect(isValidPhoneNumber('987-654-3210')).to.be.false; // Contains non-numeric characters
  });
});


