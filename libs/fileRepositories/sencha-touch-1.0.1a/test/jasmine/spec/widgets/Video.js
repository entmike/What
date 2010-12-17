describe("Ext.Video", function() {
    var video;
    
    beforeEach(function() {
        video = new Ext.Video({
            renderTo: Ext.getBody()
        });
    });
    
    afterEach(function() {
        video.destroy();
    });
    
    it("it should not have a posterUrl by default", function() {
        expect(video.posterUrl).toEqual('');
    });
    
    it("should have a componentCls", function() {
        expect(video.componentCls).toEqual('x-video');
    });
    
    describe("when posterUrl", function() {
        beforeEach(function() {
            video.destroy();
            video = new Ext.Video({
                posterUrl : 'url'
            });
        });
        
        it("should setup the posterUrl", function() {
            expect(video.ghost).not.toBeDefined();
            
            video.render(Ext.getBody());
            
            expect(video.ghost).toBeDefined();
        });
        
        describe("when onGhostTap", function() {
            beforeEach(function() {
                video.render(Ext.getBody());
            });
            
            it("should show media", function() {
                spyOn(video.media, "show");
                
                video.onGhostTap();
                
                expect(video.media.show).wasCalled();
            });
            
            it("should hide ghost", function() {
                spyOn(video.ghost, "hide");
                
                video.onGhostTap();
                
                expect(video.ghost.hide).wasCalled();
            });
            
            it("should play", function() {
                spyOn(video, "play");
                
                video.onGhostTap();
                
                expect(video.play).wasCalled();
            });
        });
    });
});