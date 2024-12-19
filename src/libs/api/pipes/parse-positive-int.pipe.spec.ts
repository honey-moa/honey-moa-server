import { ArgumentMetadata } from '@nestjs/common';
import { HttpBadRequestException } from '@src/libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { ParsePositiveIntPipe } from '@src/libs/api/pipes/parse-positive-int.pipe';

describe(ParsePositiveIntPipe.name, () => {
  let target: ParsePositiveIntPipe;

  describe(ParsePositiveIntPipe.prototype.transform.name, () => {
    beforeEach(() => {
      target = new ParsePositiveIntPipe();
    });

    describe('when validation passes and transform false', () => {
      it('should return string', async () => {
        const num = '3';

        expect(target.transform(num, {} as ArgumentMetadata)).toBe(num);
      });
    });

    describe('when validation fails', () => {
      it('should throw an error', async () => {
        expect(() =>
          target.transform('123abc', {} as ArgumentMetadata),
        ).toThrow(HttpBadRequestException);
      });

      it('should throw an error when number has wrong number encoding', async () => {
        expect(() => target.transform('0xFF', {} as ArgumentMetadata)).toThrow(
          HttpBadRequestException,
        );
      });

      it('should throw an error when negative number', async () => {
        expect(() => target.transform('-3', {} as ArgumentMetadata)).toThrow(
          HttpBadRequestException,
        );
      });

      it('should throw an error when negative float', async () => {
        expect(() => target.transform('-3.1', {} as ArgumentMetadata)).toThrow(
          HttpBadRequestException,
        );
      });

      it('should throw an error when positive float', async () => {
        expect(() => target.transform('3.1', {} as ArgumentMetadata)).toThrow(
          HttpBadRequestException,
        );
      });
    });
  });

  describe(ParsePositiveIntPipe.prototype.transform.name, () => {
    beforeEach(() => {
      target = new ParsePositiveIntPipe({ transform: true });
    });

    describe('when validation passes and transform false', () => {
      it('should return string', async () => {
        const num = '3';

        expect(target.transform(num, {} as ArgumentMetadata)).toBe(
          parseInt(num, 10),
        );
      });
    });

    describe('when validation fails', () => {
      it('should throw an error', async () => {
        expect(() =>
          target.transform('123abc', {} as ArgumentMetadata),
        ).toThrow(HttpBadRequestException);
      });

      it('should throw an error when number has wrong number encoding', async () => {
        expect(() => target.transform('0xFF', {} as ArgumentMetadata)).toThrow(
          HttpBadRequestException,
        );
      });

      it('should throw an error when negative number', async () => {
        expect(() => target.transform('-3', {} as ArgumentMetadata)).toThrow(
          HttpBadRequestException,
        );
      });

      it('should throw an error when negative float', async () => {
        expect(() => target.transform('-3.1', {} as ArgumentMetadata)).toThrow(
          HttpBadRequestException,
        );
      });

      it('should throw an error when positive float', async () => {
        expect(() => target.transform('3.1', {} as ArgumentMetadata)).toThrow(
          HttpBadRequestException,
        );
      });
    });
  });
});
