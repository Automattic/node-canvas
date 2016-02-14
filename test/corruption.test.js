'use strict';

var Canvas = require('../')
    , assert = require('assert');

var imageBase64 =
"/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAPAAA/+ED82h0dHA6Ly9ucy5hZG9iZS5j" +
"b20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtj" +
"OWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1Q" +
"IENvcmUgNS41LWMwMjEgNzkuMTU1NzcyLCAyMDE0LzAxLzEzLTE5OjQ0OjAwICAgICAgICAiPiA8cmRm" +
"OlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMi" +
"PiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5j" +
"b20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4" +
"bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIg" +
"eG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bXA6Q3JlYXRvclRvb2w9" +
"IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDE0LTA5LTAz" +
"VDA5OjUxOjMzLTA0OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxNC0wOS0wM1QxMzo1NjozOC0wNDowMCIg" +
"eG1wOk1ldGFkYXRhRGF0ZT0iMjAxNC0wOS0wM1QxMzo1NjozOC0wNDowMCIgeG1wTU06SW5zdGFuY2VJ" +
"RD0ieG1wLmlpZDo3NzlGQUVGOTJCOTYxMUU0QUQxRUJFNzIxNkE1RjhENSIgeG1wTU06RG9jdW1lbnRJ" +
"RD0ieG1wLmRpZDo3NzlGQUVGQTJCOTYxMUU0QUQxRUJFNzIxNkE1RjhENSIgZGM6Zm9ybWF0PSJpbWFn" +
"ZS9qcGVnIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NjBDN0I4" +
"ODM1NDk4MTFFMkI2Nzk5NDYyQTYzRTA5MkIiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NjBDN0I4" +
"ODQ1NDk4MTFFMkI2Nzk5NDYyQTYzRTA5MkIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4g" +
"PC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7/7gAOQWRvYmUAZMAAAAAB/9sAhAAGBAQEBQQG" +
"BQUGCQYFBgkLCAYGCAsMCgoLCgoMEAwMDAwMDBAMDg8QDw4MExMUFBMTHBsbGxwfHx8fHx8fHx8fAQcH" +
"Bw0MDRgQEBgaFREVGh8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8f" +
"Hx//wAARCACgAJYDAREAAhEBAxEB/8QAsQABAAEFAQEAAAAAAAAAAAAAAAUCAwQGBwEIAQEAAQUBAQAA" +
"AAAAAAAAAAAABQECAwQGBwgQAAEDAwAHAwgHBQcFAAAAAAEAAgMRBAUhMUFRYRIGcRMHgZGhIjJCkhSx" +
"UmKCoiMzwdFy0hXwssJDUxYXk8PTJHQRAAIBAgIFCQcDAwUBAAAAAAABAhEDBAUhMUFREmFxgZGh0TIT" +
"BvCxweEiQhVSYhRyIzPxssJzJBb/2gAMAwEAAhEDEQA/APqlAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAE" +
"AQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEBRLNDDG6SV7Y42CrnuIDQOJOgICAvuvum7Ulrbg3" +
"Lx7sDeYeR55WH4lgnibcdpv2ssvz1Ra59HvIifxRtQfyLF7xvkkDD5mtk+lYHj47EzcjkV3bKK6+4sjx" +
"TfXTjW0/+g/+FU/nrcX/AIGf6kZEHinjCaXNpLHxjLZB+Lu1csdDbUxzyK8tTiydx3WXTmQIbDesbI7Q" +
"I5axOruHPQOP8JK2IX4S1Mj72BvWvFFpdnWTQIKymqEAQBAEAQBAEAQBAEAJAFSgNC6o8U8fYufa4oNv" +
"LoaHTVrCw9o9s9mjitO/jIw0LSycwGR3Ly4p/RDtZzrI9R5bKy95fXL5iDVrCaMb/C0UaPIFGXL8p62d" +
"Ph8Basr6I6d+3rMdk3FYjO4l0XHFVLeE8dcIFEsvmVC9RMd8u4oZEiXwfXufwrmthnM1q3XazVcyn2dN" +
"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";

var imageData = new Buffer(imageBase64, 'base64');

function loadImage(data)
{
    try
    {
		var img = new Canvas.Image();
		img.src = data;

		var cv = new Canvas(img.width, img.height);
		var ctx = cv.getContext('2d');

		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, img.width, img.height);
		ctx.drawImage(img, 0, 0, img.width, img.height);

		var rtrn = cv.toBuffer();
        return true;
    }
    catch(ex)
    {
        return false;
    }
}

describe('Corrupt data', function() {
  it('should not quit on load', function() {
    var ok = 0;
    var failed = 0;
    var start = 1060;
    var end = 1080;

    for(var i = start; i < end; i++)
    {
        var copy = imageData.slice(0);
        copy[i]++;

        if(loadImage(copy))
            ok++;
        else
            failed++;
    }

    assert.equal(ok+failed, end-start);
  });

  it.skip('recovers from bad header bytes', function() {

    var bad0 = imageData.slice(0);
    var bad1 = imageData.slice(0);
    bad0[0]++;
    bad1[1]++;

    assert.equal(loadImage(imageData), true);

    assert.equal(loadImage(bad0), false);
    assert.equal(loadImage(bad1), false);

    // If the original image can be loaded after corrupting header data
	// on a different image, then this assertion should pass
    assert.equal(loadImage(imageData), true);
  });
});
