/* global describe, it */
var expect = require('expect.js')
var mock = require('mck')
var aws = require('aws-sdk')
var SQS = require('./index.js')

describe('constructor', function() {
	it('interprets region', function() {
		var ctor = mock.once(aws, 'SQS', function(opts) {
			expect(opts.accessKeyId).to.be('access')
			expect(opts.secretAccessKey).to.be('secret')
			expect(opts.region).to.be('eu-west-1')
		})

		SQS({
			accessKeyId: 'access',
			secretAccessKey: 'secret',
			url: 'https://sqs.eu-west-1.aws.amazon.com/bla-bla'
		})

		expect(ctor.invokes).to.be(1)
	})
})
