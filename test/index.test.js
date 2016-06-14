/*eslint-env mocha */
/*eslint-disable no-unused-expressions*/
'use strict';

import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';

chai.use(sinonChai);
chai.use(chaiAsPromised);

const jQueryStub = {
    ajax: () => {}
};
const jQueryRequestWrap = proxyquire('../src', { 'jquery': jQueryStub }).default;

describe('jquery-request-wrap', () => {
    let ajaxStub,
        jqXHR,
        successAjaxStub,
        errorAjaxStub,
        responseHeaders;

    beforeEach(() => {
        responseHeaders = {
            test: 'header',
            header2: 'Test2',
            header3: 'test3'
        };

        jqXHR = {
            getAllResponseHeaders: () => {
                let headers = [];

                for (let header in responseHeaders) {
                    let headerKey = header,
                        headerValue = responseHeaders[headerKey];

                    headers.push(`${headerKey}:${headerValue}`)
                }

                return headers.join('\r\n');
            }
        };

        successAjaxStub = (uri, opts) => {
            jqXHR.status = 200;

            //data, textStatus, jqXHR
            return opts.success('test', null, jqXHR);
        };

        errorAjaxStub = (uri, opts) => {
            jqXHR.status = 500;

            //jqXHR, textStatus, errorThrown
            return opts.error(jqXHR);
        };
    });

    describe('parsejqXHRHeaders()', () => {
        it('should return an object of parsed headers', () => {
            const expectedHeaders = {
                test: 'header',
                header2: 'Test2',
                header3: 'test3'
            };

            expect(jQueryRequestWrap.parsejqXHRHeaders(jqXHR)).to.deep.equal(expectedHeaders);
        });

        it('should lowercase the header first characters', () => {
            responseHeaders = {
                Test: 'header',
                Header2: 'Test2',
                HeADER3: 'test3'
            };

            const expectedHeaders = {
                test: 'header',
                header2: 'Test2',
                heADER3: 'test3'
            };

            expect(jQueryRequestWrap.parsejqXHRHeaders(jqXHR)).to.deep.equal(expectedHeaders);
        });
    });

    describe('setupJQueryOpts()', () => {
        it('should return an object with a success property', () => {
            expect(jQueryRequestWrap.setupJQueryOpts({})).to.have.property('success');
        });

        it('should return an object with a error property', () => {
            expect(jQueryRequestWrap.setupJQueryOpts({})).to.have.property('error');
        });

        it('should set its dataType property to json if passed json as an option', () => {
            expect(jQueryRequestWrap.setupJQueryOpts({ json: true })).to.have.property('dataType', 'json');
        });

        it('should set its headers property to the headers passed as options', () => {
            const expectedHeaders = {
                test: 'header',
                header2: 'Test2',
                heADER3: 'test3'
            };

            expect(jQueryRequestWrap.setupJQueryOpts({ headers: expectedHeaders })).to.have.property('headers', expectedHeaders);
        });
    });

    describe('success', (done) => {
        it('should call the callback with null as the first parameter', (done) => {
            jQueryRequestWrap.success("data", "textStatus", jqXHR, (err, response, body) => {
                expect(err).to.be.null;
                done();
            });
        });

        it('should call the callback with a response object as the second parameter', (done) => {
            const expectedResponse = {
                statusCode: 200,
                headers: {
                    test: 'header',
                    header2: 'Test2',
                    header3: 'test3'
                }
            };

            jQueryRequestWrap.success("data", "textStatus", jqXHR, (err, response, body) => {
                expect(err).to.be.null;
                done();
            });
        });

        it('should call the callback with the response body as the third parameter', (done) => {
            const expectedBody = 'test';

            jQueryRequestWrap.success(expectedBody, "textStatus", jqXHR, (err, response, body) => {
                expect(err).to.be.null;
                done();
            });
        })
    });

    describe('error', (done) => {
        it('should call the callback with the statusText of the jqXHR as the first parameter', () => {
            const expectedError = jqXHR.statusText = "test";

            jQueryRequestWrap.error(jqXHR, "textStatus", "errorThrow", (err, response, body) => {
                expect(err).to.deep.equal(expectedError);
            });
        });

        it('should call the callback with an object containing the status code of the jqXHR as the second parameter', () => {
            const expectedCode = jqXHR.status = 999;

            jQueryRequestWrap.error(jqXHR, "textStatus", "errorThrow", (err, response, body) => {
                expect(response).to.deep.equal({
                    statusCode: expectedCode
                });
            });
        });

        it('should call the callback with the responseText of the jqXHR as the third parameter', () => {
            const expectedBody = jqXHR.responseText = "test";

            jQueryRequestWrap.error(jqXHR, "textStatus", "errorThrow", (err, response, body) => {
                expect(body).to.deep.equal(expectedBody);
            });
        });
    });

    describe('get()', () => {
        it('should call $.ajax', (done) => {
            ajaxStub = sinon.stub(jQueryStub, 'ajax', successAjaxStub);

            jQueryRequestWrap.get({}, () => {
                expect(ajaxStub).to.have.been.called;

                ajaxStub.restore();
                done();
            });
        });

        it('should call $.ajax with the uri option as the first parameter', (done) => {
            const expectedURI = 'test';

            ajaxStub = sinon.stub(jQueryStub, 'ajax', successAjaxStub);

            jQueryRequestWrap.get({
                uri: expectedURI
            }, () => {
                expect(ajaxStub).to.have.been.calledWith(sinon.match(expectedURI));

                ajaxStub.restore();
                done();
            });
        });

        it('should call $.ajax with its data option set to the body option parameter', (done) => {
            const expectedBody = 'test';

            ajaxStub = sinon.stub(jQueryStub, 'ajax', successAjaxStub);

            jQueryRequestWrap.get({
                body: expectedBody
            }, () => {
                expect(ajaxStub).to.have.been.calledWith(sinon.match.any, sinon.match({
                    data: expectedBody
                }));

                ajaxStub.restore();
                done();
            });
        });
    });

    describe('post()', () => {
        it('should call $.ajax', (done) => {
            ajaxStub = sinon.stub(jQueryStub, 'ajax', successAjaxStub);

            jQueryRequestWrap.post({}, () => {
                expect(ajaxStub).to.have.been.called;

                ajaxStub.restore();
                done();
            });
        });

        it('should call $.ajax with the uri option as the first parameter', (done) => {
            const expectedURI = 'test';

            ajaxStub = sinon.stub(jQueryStub, 'ajax', successAjaxStub);

            jQueryRequestWrap.post({
                uri: expectedURI
            }, () => {
                expect(ajaxStub).to.have.been.calledWith(sinon.match(expectedURI));

                ajaxStub.restore();
                done();
            });
        });

        it('should call $.ajax with its data option set to the body option parameter', (done) => {
            const expectedBody = 'test';

            ajaxStub = sinon.stub(jQueryStub, 'ajax', successAjaxStub);

            jQueryRequestWrap.post({
                body: expectedBody
            }, () => {
                expect(ajaxStub).to.have.been.calledWith(sinon.match.any, sinon.match({
                    data: expectedBody
                }));

                ajaxStub.restore();
                done();
            });
        });

        it('should call $.ajax with its method option set to "post"', (done) => {
            const expectedMethod = 'post';

            ajaxStub = sinon.stub(jQueryStub, 'ajax', successAjaxStub);

            jQueryRequestWrap.post({}, () => {
                expect(ajaxStub).to.have.been.calledWith(sinon.match.any, sinon.match({
                    method: expectedMethod
                }));

                ajaxStub.restore();
                done();
            });
        });
    });

    describe('delete()', () => {
        it('should call $.ajax', (done) => {
            ajaxStub = sinon.stub(jQueryStub, 'ajax', successAjaxStub);

            jQueryRequestWrap.delete({}, () => {
                expect(ajaxStub).to.have.been.called;

                ajaxStub.restore();
                done();
            });
        });

        it('should call $.ajax with the uri option as the first parameter', (done) => {
            const expectedURI = 'test';

            ajaxStub = sinon.stub(jQueryStub, 'ajax', successAjaxStub);

            jQueryRequestWrap.delete({
                uri: expectedURI
            }, () => {
                expect(ajaxStub).to.have.been.calledWith(sinon.match(expectedURI));

                ajaxStub.restore();
                done();
            });
        });

        it('should call $.ajax with its method option set to "delete"', (done) => {
            const expectedMethod = 'delete';

            ajaxStub = sinon.stub(jQueryStub, 'ajax', successAjaxStub);

            jQueryRequestWrap.delete({}, () => {
                expect(ajaxStub).to.have.been.calledWith(sinon.match.any, sinon.match({
                    method: expectedMethod
                }));

                ajaxStub.restore();
                done();
            });
        });
    });

    describe('patch()', () => {
        it('should call $.ajax', (done) => {
            ajaxStub = sinon.stub(jQueryStub, 'ajax', successAjaxStub);

            jQueryRequestWrap.patch({}, () => {
                expect(ajaxStub).to.have.been.called;

                ajaxStub.restore();
                done();
            });
        });

        it('should call $.ajax with the uri option as the first parameter', (done) => {
            const expectedURI = 'test';

            ajaxStub = sinon.stub(jQueryStub, 'ajax', successAjaxStub);

            jQueryRequestWrap.patch({
                uri: expectedURI
            }, () => {
                expect(ajaxStub).to.have.been.calledWith(sinon.match(expectedURI));

                ajaxStub.restore();
                done();
            });
        });

        it('should call $.ajax with its data option set to the body option parameter', (done) => {
            const expectedBody = 'test';

            ajaxStub = sinon.stub(jQueryStub, 'ajax', successAjaxStub);

            jQueryRequestWrap.patch({
                body: expectedBody
            }, () => {
                expect(ajaxStub).to.have.been.calledWith(sinon.match.any, sinon.match({
                    data: expectedBody
                }));

                ajaxStub.restore();
                done();
            });
        });

        it('should call $.ajax with its method option set to "patch"', (done) => {
            const expectedMethod = 'patch';

            ajaxStub = sinon.stub(jQueryStub, 'ajax', successAjaxStub);

            jQueryRequestWrap.patch({}, () => {
                expect(ajaxStub).to.have.been.calledWith(sinon.match.any, sinon.match({
                    method: expectedMethod
                }));

                ajaxStub.restore();
                done();
            });
        });
    });
});