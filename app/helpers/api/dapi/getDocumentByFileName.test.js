import { getDocument, ErrorContext } from 'buying-catalogue-library';
import { getDocumentByFileName } from './getDocumentByFileName';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

const pipe = jest.fn();
const setHeader = jest.fn();

describe('Document controller', () => {
  describe('getDocumentByFileName', () => {
    beforeEach(() => {
      getDocument
        .mockResolvedValue({ data: { pipe } });
    });

    afterEach(() => {
      getDocument.mockReset();
      pipe.mockReset();
      setHeader.mockReset();
    });

    it('should call getDocument once with the correct params', async () => {
      await getDocumentByFileName({
        res: { setHeader },
        documentName: 'a-document.pdf',
        contentType: 'application/pdf',
      });

      expect(getDocument.mock.calls.length).toEqual(1);
      expect(getDocument).toHaveBeenCalledWith({
        documentEndpoint: 'http://localhost:5101/api/v1/documents/a-document.pdf',
        logger,
      });
    });

    describe('no error from getDocument', () => {
      it('should call setHeader once with the content type', async () => {
        await getDocumentByFileName({
          res: { setHeader },
          documentName: 'a-document.pdf',
          contentType: 'application/pdf',
        });

        expect(setHeader.mock.calls.length).toEqual(1);
        expect(setHeader).toHaveBeenCalledWith('Content-type', 'application/pdf');
      });

      it('should call res.data.pipe once with res', async () => {
        await getDocumentByFileName({
          res: { setHeader },
          documentName: 'a-document.pdf',
          contentType: 'application/pdf',
        });

        expect(pipe.mock.calls.length).toEqual(1);
        expect(pipe).toHaveBeenCalledWith({ setHeader });
      });
    });

    describe('404 error from getDocument', () => {
      it('should not call setHeader', async () => {
        getDocument
          .mockRejectedValue({ response: { status: 404 } });
        try {
          await getDocumentByFileName({
            res: { setHeader },
            documentName: 'a-document.pdf',
            contentType: 'application/pdf',
          });
        } catch (err) {
          expect(setHeader.mock.calls.length).toEqual(0);
        }
      });

      it('should throw new ErrorContext', async () => {
        getDocument
          .mockRejectedValue({ response: { status: 404 } });
        try {
          await getDocumentByFileName({
            res: { setHeader },
            documentName: 'a-document.pdf',
            contentType: 'application/pdf',
          });
        } catch (err) {
          expect(err).toBeInstanceOf(ErrorContext);
        }
      });
    });

    describe('non-404 error from getDocument', () => {
      it('should not call setHeader', async () => {
        getDocument
          .mockRejectedValue({ response: { status: 500 } });
        try {
          await getDocumentByFileName({
            res: { setHeader },
            documentName: 'a-document.pdf',
            contentType: 'application/pdf',
          });
        } catch (err) {
          expect(setHeader.mock.calls.length).toEqual(0);
        }
      });

      it('should throw error', async () => {
        getDocument
          .mockRejectedValue({ response: { status: 500 } });
        try {
          await getDocumentByFileName({
            res: { setHeader },
            documentName: 'a-document.pdf',
            contentType: 'application/pdf',
          });
        } catch (err) {
          expect(err).toEqual({ response: { status: 500 } });
        }
      });
    });
  });
});
