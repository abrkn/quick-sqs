module.exports = exports = function(opts) {
	var AWS = require('aws-sdk')
	var region = opts.region
	var regionMatch

    this.queueUrl = opts.queueUrl || opts.url

	if (!region && (regionMatch = this.queueUrl.match(/^https?:\/\/sqs\.([^\.]+)/))) {
		region = regionMatch[1]
	}

    this.sqs = new AWS.SQS({
    	accessKeyId: opts.accessKeyId,
    	secretAccessKey: opts.secretAccessKey,
    	region: region
    })
}

exports.prototype.receiveOne = exports.prototype.receive = function(cb) {
	var args = arguments

	this.sqs.receiveMessage({
		QueueUrl: this.queueUrl
	}, function(err, data) {
		if (err) return cb(err)
		if (!data.Messages) {
			return setImmediate(function() {
				this.receiveOne.apply(this, args)
			}.bind(this))
		}
		var msg = data.Messages[0]
		cb(null, {
			handle: msg.ReceiptHandle,
			body: JSON.parse(msg.Body),
			delete: this.deleteOne.bind(this, msg.ReceiptHandle)
		})
	}.bind(this))
}

exports.prototype.sendOne = exports.prototype.send = function(body, cb) {
	this.sqs.sendMessage({
		QueueUrl: this.queueUrl,
		MessageBody: JSON.stringify(body)
	}, function(err, data) {
		cb(err, !err && data.MessageId)
	})
}

exports.prototype.deleteOne = exports.prototype.delete = function(handle, cb) {
	this.sqs.deleteMessage({
		QueueUrl: this.queueUrl,
		ReceiptHandle: handle.handle || handle
	}, function(err) {
		cb(err)
	})
}
