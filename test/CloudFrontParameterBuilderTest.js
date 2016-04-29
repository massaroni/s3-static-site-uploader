var builder = requireCov('../src/CloudFrontParameterBuilder.js');

describe('CloudFrontParameterBuilder',function(){
    describe('createInvalidation', function () {
        it('formats the list of paths to invalidate', function () {
            var paths = [
                '/test/one',
                '/test/deep/two',
                'three'
            ];
            var result = builder.createInvalidation('my-distribution', paths);
            expect(result.DistributionId).to.equal('my-distribution');
            expect(result.InvalidationBatch.Paths.Quantity).to.equal(paths.length);
            expect(result.InvalidationBatch.Paths.Items).to.deep.equal(paths);
        });
    });
});
