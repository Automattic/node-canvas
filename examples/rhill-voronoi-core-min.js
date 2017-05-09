/* eslint-disable */
/*!
A custom Javascript implementation of Steven J. Fortune's algorithm to
compute Voronoi diagrams.
Copyright (C) 2010 Raymond Hill

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

*****

Author: Raymond Hill (rhill@raymondhill.net)
File: rhill-voronoi-core-min.js
Version: 0.9
Date: Sep. 21, 2010
Description: This is my personal Javascript implementation of
Steven Fortune's algorithm to generate Voronoi diagrams.

Portions of this software use, or depend on the work of:

  "Fortune's algorithm" by Steven J. Fortune: For his clever
  algorithm to compute Voronoi diagrams.
  http://ect.bell-labs.com/who/sjf/

  "The Liang-Barsky line clipping algorithm in a nutshell!" by Daniel White,
  to efficiently clip a line within a rectangle.
  http://www.skytopia.com/project/articles/compsci/clipping.html

*****

Usage:

  var vertices = [{x:300,y:300}, {x:100,y:100}, {x:200,y:500}, {x:250,y:450}, {x:600,y:150}];
  // xl, xr means x left, x right
  // yt, yb means y top, y bottom
  var bbox = {xl:0, xr:800, yt:0, yb:600};
  var voronoi = new Voronoi();
  // pass an array of objects, each of which exhibits x and y properties
  voronoi.setSites(vertices);
  // pass an object which exhibits xl, xr, yt, yb properties. The bounding
  // box will be used to connect unbound edges, and to close open cells
  result = voronoi.compute(bbox);
  // render, further analyze, etc.

Return value:
  An object with the following properties:

  result.sites = an array of unordered, unique Voronoi.Site objects underlying the Voronoi diagram.
  result.edges = an array of unordered, unique Voronoi.Edge objects making up the Voronoi diagram.
  result.cells = a dictionary of Voronoi.Cell object making up the Voronoi diagram. The Voronoi.Cell
    in the dictionary are keyed on their associated Voronoi.Site's unique id.
  result.execTime = the time it took to compute the Voronoi diagram, in milliseconds.

Voronoi.Site object:
  id: a unique id identifying this Voronoi site.
  x: the x position of this Voronoi site.
  y: the y position of this Voronoi site.
  destroy(): mark this Voronoi site object as destroyed, it will be removed from the
    internal collection and won't be part of the next Voronoi diagram computation.

  When adding vertices to the Voronoi object, through Voronoi.setSites() or
  Voronoi.addSites(), an internal collection of matching Voronoi.Site object is maintained,
  which is read accessible at all time through Voronoi.getSites(). You are allowed to
  change the x and/or y properties of any Voronoi.Site object in the array, before
  launching the computation of the Voronoi diagram. However, do *not* change the id
  of any Voronoi.Site object, this could break the computation of the Voronoi diagram.

Voronoi.Edge object:
  id: a unique id identifying this Voronoi edge.
  lSite: the Voronoi.Site object at the left of this Voronoi.Edge object.
  rSite: the Voronoi.Site object at the right of this Voronoi.Edge object (can be null).
  va: the Voronoi.Vertex object defining the start point (relative to the Voronoi.Site
    on the left) of this Voronoi.Edge object.
  vb: the Voronoi.Vertex object defining the end point (relative to Voronoi.Site on
    the left) of this Voronoi.Edge object.

  For edges which are used to close open cells (using the supplied bounding box), the
  rSite property will be null.

Voronoi.Cells object:
  A collection of Voronoi.Cell objects, keyed on the id of the associated Voronoi.Site
    object.
  numCells: the number of Voronoi.Cell objects in the collection.

Voronoi.Cell object:
  site: the Voronoi.Site object associated with the Voronoi cell.
  halfedges: an array of Voronoi.Halfedge objects, ordered counterclockwise, defining the
    polygon for this Voronoi cell.

Voronoi.Halfedge object:
  site: the Voronoi.Site object owning this Voronoi.Halfedge object.
  edge: a reference to the unique Voronoi.Edge object underlying this Voronoi.Halfedge object.
  getStartpoint(): a method returning a Voronoi.Vertex for the start point of this
    halfedge. Keep in mind halfedges are always countercockwise.
  getEndpoint(): a method returning a Voronoi.Vertex for the end point of this
    halfedge. Keep in mind halfedges are always countercockwise.

Voronoi.Vertex object:
  x: the x coordinate.
  y: the y coordinate.

*/
function Voronoi(){this.sites=[];this.siteEvents=[];this.circEvents=[];this.arcs=[];this.edges=[];this.cells=new this.Cells()}Voronoi.prototype.SITE_EVENT=0;Voronoi.prototype.CIRCLE_EVENT=1;Voronoi.prototype.VOID_EVENT=-1;Voronoi.prototype.sqrt=Math.sqrt;Voronoi.prototype.abs=Math.abs;Voronoi.prototype.floor=Math.floor;Voronoi.prototype.random=Math.random;Voronoi.prototype.round=Math.round;Voronoi.prototype.min=Math.min;Voronoi.prototype.max=Math.max;Voronoi.prototype.pow=Math.pow;Voronoi.prototype.isNaN=isNaN;Voronoi.prototype.PI=Math.PI;Voronoi.prototype.EPSILON=1e-5;Voronoi.prototype.equalWithEpsilon=function(a,b){return this.abs(a-b)<1e-5};Voronoi.prototype.greaterThanWithEpsilon=function(a,b){return(a-b)>1e-5};Voronoi.prototype.greaterThanOrEqualWithEpsilon=function(a,b){return(b-a)<1e-5};Voronoi.prototype.lessThanWithEpsilon=function(a,b){return(b-a)>1e-5};Voronoi.prototype.lessThanOrEqualWithEpsilon=function(a,b){return(a-b)<1e-5};Voronoi.prototype.Beachsection=function(a){this.site=a;this.edge=null;this.sweep=-Infinity;this.lid=0;this.circleEvent=undefined};Voronoi.prototype.Beachsection.prototype.sqrt=Math.sqrt;Voronoi.prototype.Beachsection.prototype._leftParabolicCut=function(a,c,d){var e=a.x;var f=a.y;if(f==d){return e}var g=c.x;var h=c.y;if(h==d){return g}if(f==h){return(e+g)/2}var i=f-d;var j=h-d;var k=g-e;var l=1/i-1/j;var b=k/j;return(-b+this.sqrt(b*b-2*l*(k*k/(-2*j)-h+j/2+f-i/2)))/l+e};Voronoi.prototype.Beachsection.prototype.leftParabolicCut=function(a,b){if(this.sweep!==b||this.lid!==a.id){this.sweep=b;this.lid=a.id;this.lBreak=this._leftParabolicCut(this.site,a,b)}return this.lBreak};Voronoi.prototype.Beachsection.prototype.isCollapsing=function(){return this.circleEvent!==undefined&&this.circleEvent.type===Voronoi.prototype.CIRCLE_EVENT};Voronoi.prototype.Site=function(x,y){this.id=this.constructor.prototype.idgenerator++;this.x=x;this.y=y};Voronoi.prototype.Site.prototype.destroy=function(){this.id=0};Voronoi.prototype.Vertex=function(x,y){this.x=x;this.y=y};Voronoi.prototype.Edge=function(a,b){this.id=this.constructor.prototype.idgenerator++;this.lSite=a;this.rSite=b;this.va=this.vb=undefined};Voronoi.prototype.Halfedge=function(a,b){this.site=a;this.edge=b};Voronoi.prototype.Cell=function(a){this.site=a;this.halfedges=[]};Voronoi.prototype.Cells=function(){this.numCells=0};Voronoi.prototype.Cells.prototype.addCell=function(a){this[a.site.id]=a;this.numCells++};Voronoi.prototype.Cells.prototype.removeCell=function(a){delete this[a.site.id];this.numCells--};Voronoi.prototype.Site.prototype.idgenerator=1;Voronoi.prototype.Edge.prototype.isLineSegment=function(){return this.id!==0&&Boolean(this.va)&&Boolean(this.vb)};Voronoi.prototype.Edge.prototype.idgenerator=1;Voronoi.prototype.Halfedge.prototype.isLineSegment=function(){return this.edge.id!==0&&Boolean(this.edge.va)&&Boolean(this.edge.vb)};Voronoi.prototype.Halfedge.prototype.getStartpoint=function(){return this.edge.lSite.id==this.site.id?this.edge.va:this.edge.vb};Voronoi.prototype.Halfedge.prototype.getEndpoint=function(){return this.edge.lSite.id==this.site.id?this.edge.vb:this.edge.va};Voronoi.prototype.leftBreakPoint=function(a,b){var c=this.arcs[a];var d=c.site;if(d.y==b){return d.x}if(a===0){return-Infinity}return c.leftParabolicCut(this.arcs[a-1].site,b)};Voronoi.prototype.rightBreakPoint=function(a,b){if(a<this.arcs.length-1){return this.leftBreakPoint(a+1,b)}var c=this.arcs[a].site;return c.y==b?c.x:Infinity};Voronoi.prototype.findInsertionPoint=function(x,a){var n=this.arcs.length;if(!n){return 0}var l=0;var r=n;var i;while(l<r){i=(l+r)>>1;if(this.lessThanWithEpsilon(x,this.leftBreakPoint(i,a))){r=i;continue}if(this.greaterThanOrEqualWithEpsilon(x,this.rightBreakPoint(i,a))){l=i+1;continue}return i}return l};Voronoi.prototype.findDeletionPoint=function(x,a){var n=this.arcs.length;if(!n){return 0}var l=0;var r=n;var i;var b;while(l<r){i=(l+r)>>1;b=this.leftBreakPoint(i,a);if(this.lessThanWithEpsilon(x,b)){r=i;continue}if(this.greaterThanWithEpsilon(x,b)){l=i+1;continue}b=this.rightBreakPoint(i,a);if(this.greaterThanWithEpsilon(x,b)){l=i+1;continue}if(this.lessThanWithEpsilon(x,b)){r=i;continue}return i}};Voronoi.prototype.createEdge=function(a,b,c,d){var e=new this.Edge(a,b);this.edges.push(e);if(c!==undefined){this.setEdgeStartpoint(e,a,b,c)}if(d!==undefined){this.setEdgeEndpoint(e,a,b,d)}this.cells[a.id].halfedges.push(new this.Halfedge(a,e));this.cells[b.id].halfedges.push(new this.Halfedge(b,e));return e};Voronoi.prototype.createBorderEdge=function(a,b,c){var d=new this.Edge(a,null);d.va=b;d.vb=c;this.edges.push(d);return d};Voronoi.prototype.destroyEdge=function(a){a.id=0};Voronoi.prototype.setEdgeStartpoint=function(a,b,c,d){if(a.va===undefined&&a.vb===undefined){a.va=d;a.lSite=b;a.rSite=c}else if(a.lSite.id==c.id){a.vb=d}else{a.va=d}};Voronoi.prototype.setEdgeEndpoint=function(a,b,c,d){this.setEdgeStartpoint(a,c,b,d)};Voronoi.prototype.removeArc=function(a){var x=a.center.x;var y=a.center.y;var b=a.y;var c=this.findDeletionPoint(x,b);var d=c;while(d-1>0&&this.equalWithEpsilon(x,this.leftBreakPoint(d-1,b))){d--}var e=c;while(e+1<this.arcs.length&&this.equalWithEpsilon(x,this.rightBreakPoint(e+1,b))){e++}var f,rArc;for(var g=d;g<=e+1;g++){f=this.arcs[g-1];rArc=this.arcs[g];this.setEdgeStartpoint(rArc.edge,f.site,rArc.site,new this.Vertex(x,y))}this.voidCircleEvents(d-1,e+1);this.arcs.splice(d,e-d+1);f=this.arcs[d-1];rArc=this.arcs[d];rArc.edge=this.createEdge(f.site,rArc.site,undefined,new this.Vertex(x,y));this.addCircleEvents(d-1,b);this.addCircleEvents(d,b)};Voronoi.prototype.addArc=function(a){var b=new this.Beachsection(a);var c=this.findInsertionPoint(a.x,a.y);if(c==this.arcs.length){this.arcs.push(b);if(c===0){return}b.edge=this.createEdge(this.arcs[c-1].site,b.site);return}var d,rArc;if(c>0&&this.equalWithEpsilon(a.x,this.rightBreakPoint(c-1,a.y))&&this.equalWithEpsilon(a.x,this.leftBreakPoint(c,a.y))){d=this.arcs[c-1];rArc=this.arcs[c];this.voidCircleEvents(c-1,c);var e=this.circumcircle(d.site,a,rArc.site);this.setEdgeStartpoint(rArc.edge,d.site,rArc.site,new this.Vertex(e.x,e.y));b.edge=this.createEdge(d.site,b.site,undefined,new this.Vertex(e.x,e.y));rArc.edge=this.createEdge(b.site,rArc.site,undefined,new this.Vertex(e.x,e.y));this.arcs.splice(c,0,b);this.addCircleEvents(c-1,a.y);this.addCircleEvents(c+1,a.y);return}this.voidCircleEvents(c);d=this.arcs[c];rArc=new this.Beachsection(d.site);this.arcs.splice(c+1,0,b,rArc);b.edge=rArc.edge=this.createEdge(d.site,b.site);this.addCircleEvents(c,a.y);this.addCircleEvents(c+2,a.y)};Voronoi.prototype.circumcircle=function(a,b,c){var e=a.x;var f=a.y;var g=b.x-e;var h=b.y-f;var i=c.x-e;var j=c.y-f;var d=2*(g*j-h*i);var k=g*g+h*h;var l=i*i+j*j;var x=(j*k-h*l)/d;var y=(g*l-i*k)/d;return{x:x+e,y:y+f,radius:this.sqrt(x*x+y*y)}};Voronoi.prototype.addCircleEvents=function(a,b){if(a<=0||a>=this.arcs.length-1){return}var c=this.arcs[a];var d=this.arcs[a-1].site;var e=this.arcs[a].site;var f=this.arcs[a+1].site;if(d.id==f.id||d.id==e.id||e.id==f.id){return}if((d.y-e.y)*(f.x-e.x)<=(d.x-e.x)*(f.y-e.y)){return}var g=this.circumcircle(d,e,f);var h=g.y+g.radius;if(!this.greaterThanOrEqualWithEpsilon(h,b)){return}var i={type:this.CIRCLE_EVENT,site:e,x:g.x,y:h,center:{x:g.x,y:g.y}};c.circleEvent=i;this.queuePushCircle(i)};Voronoi.prototype.voidCircleEvents=function(a,b){if(b===undefined){b=a}a=this.max(a,0);b=this.min(b,this.arcs.length-1);while(a<=b){var c=this.arcs[a];if(c.circleEvent!==undefined){c.circleEvent.type=this.VOID_EVENT;c.circleEvent=undefined}a++}};Voronoi.prototype.queueSanitize=function(){var q=this.circEvents;var a=q.length;if(!a){return}var b=a;while(b&&q[b-1].type===this.VOID_EVENT){b--}var c=a-b;if(c){q.splice(b,c)}var d=this.arcs.length;if(q.length<d*2){return}while(true){a=b-1;while(a>0&&q[a-1].type!==this.VOID_EVENT){a--}if(a<=0){break}b=a-1;while(b>0&&q[b-1].type===this.VOID_EVENT){b--}c=a-b;q.splice(b,c);if(q.length<d){return}}};Voronoi.prototype.queuePop=function(){var a=this.siteEvents.length>0?this.siteEvents[this.siteEvents.length-1]:null;var b=this.circEvents.length>0?this.circEvents[this.circEvents.length-1]:null;if(Boolean(a)!==Boolean(b)){return a?this.siteEvents.pop():this.circEvents.pop()}if(!a){return null}if(a.y<b.y||(a.y==b.y&&a.x<b.x)){return this.siteEvents.pop()}return this.circEvents.pop()};Voronoi.prototype.queuePushSite=function(o){var q=this.siteEvents;var r=q.length;if(r){var l=0;var i,c;while(l<r){i=(l+r)>>1;c=o.y-q[i].y;if(!c){c=o.x-q[i].x}if(c>0){r=i}else if(c<0){l=i+1}else{return}}q.splice(l,0,o)}else{q.push(o)}};Voronoi.prototype.queuePushCircle=function(o){var q=this.circEvents;var r=q.length;if(r){var l=0;var i,c;while(l<r){i=(l+r)>>1;c=o.y-q[i].y;if(!c){c=o.x-q[i].x}if(c>0){r=i}else{l=i+1}}q.splice(l,0,o)}else{q.push(o)}};Voronoi.prototype.getBisector=function(a,b){var r={x:(a.x+b.x)/2,y:(a.y+b.y)/2};if(b.y==a.y){return r}r.m=(a.x-b.x)/(b.y-a.y);r.b=r.y-r.m*r.x;return r};Voronoi.prototype.connectEdge=function(a,b){var c=a.vb;if(!!c){return true}var d=a.va;var e=b.xl;var g=b.xr;var h=b.yt;var i=b.yb;var j=a.lSite;var k=a.rSite;var f=this.getBisector(j,k);if(f.m===undefined){if(f.x<e||f.x>=g){return false}if(j.x>k.x){if(d===undefined){d=new this.Vertex(f.x,h)}else if(d.y>=i){return false}c=new this.Vertex(f.x,i)}else{if(d===undefined){d=new this.Vertex(f.x,i)}else if(d.y<h){return false}c=new this.Vertex(f.x,h)}}else if(f.m<1){if(j.y<k.y){if(d===undefined){d=new this.Vertex(e,f.m*e+f.b)}else if(d.x>=g){return false}c=new this.Vertex(g,f.m*g+f.b)}else{if(d===undefined){d=new this.Vertex(g,f.m*g+f.b)}else if(d.x<e){return false}c=new this.Vertex(e,f.m*e+f.b)}}else{if(j.x>k.x){if(d===undefined){d=new this.Vertex((h-f.b)/f.m,h)}else if(d.y>=i){return false}c=new this.Vertex((i-f.b)/f.m,i)}else{if(d===undefined){d=new this.Vertex((i-f.b)/f.m,i)}else if(d.y<h){return false}c=new this.Vertex((h-f.b)/f.m,h)}}a.va=d;a.vb=c;return true};Voronoi.prototype.clipEdge=function(a,b){var c=a.va.x;var d=a.va.y;var e=a.vb.x;var f=a.vb.y;var g=0;var h=1;var i=e-c;var j=f-d;var q=c-b.xl;if(i===0&&q<0){return false}var r=-q/i;if(i<0){if(r<g){return false}else if(r<h){h=r}}else if(i>0){if(r>h){return false}else if(r>g){g=r}}q=b.xr-c;if(i===0&&q<0){return false}r=q/i;if(i<0){if(r>h){return false}else if(r>g){g=r}}else if(i>0){if(r<g){return false}else if(r<h){h=r}}q=d-b.yt;if(j===0&&q<0){return false}r=-q/j;if(j<0){if(r<g){return false}else if(r<h){h=r}}else if(j>0){if(r>h){return false}else if(r>g){g=r}}q=b.yb-d;if(j===0&&q<0){return false}r=q/j;if(j<0){if(r>h){return false}else if(r>g){g=r}}else if(j>0){if(r<g){return false}else if(r<h){h=r}}a.va.x=c+g*i;a.va.y=d+g*j;a.vb.x=c+h*i;a.vb.y=d+h*j;return true};Voronoi.prototype.clipEdges=function(a){var b=this.edges;var c=b.length;var d;for(var e=c-1;e>=0;e-=1){d=b[e];if(!this.connectEdge(d,a)||!this.clipEdge(d,a)||this.verticesAreEqual(d.va,d.vb)){this.destroyEdge(d);b.splice(e,1)}}};Voronoi.prototype.verticesAreEqual=function(a,b){return this.equalWithEpsilon(a.x,b.x)&&this.equalWithEpsilon(a.y,b.y)};Voronoi.prototype.sortHalfedgesCallback=function(a,b){var c=a.getStartpoint();var d=a.getEndpoint();var e=b.getStartpoint();var f=b.getEndpoint();return Math.atan2(f.y-e.y,f.x-e.x)-Math.atan2(d.y-c.y,d.x-c.x)};Voronoi.prototype.closeCells=function(a){var b=a.xl;var c=a.xr;var d=a.yt;var e=a.yb;this.clipEdges(a);var f=this.cells;var g;var h,iRight;var i,nHalfedges;var j;var k,endpoint;var l,vb;for(var m in f){g=f[m];if(!(g instanceof this.Cell)){continue}i=g.halfedges;h=i.length;while(h){iRight=h;while(iRight>0&&i[iRight-1].isLineSegment()){iRight--}h=iRight;while(h>0&&!i[h-1].isLineSegment()){h--}if(h===iRight){break}i.splice(h,iRight-h)}if(i.length===0){f.removeCell(g);continue}i.sort(this.sortHalfedgesCallback);nHalfedges=i.length;h=0;while(h<nHalfedges){iRight=(h+1)%nHalfedges;endpoint=i[h].getEndpoint();k=i[iRight].getStartpoint();if(!this.verticesAreEqual(endpoint,k)){l=new this.Vertex(endpoint.x,endpoint.y);if(this.equalWithEpsilon(endpoint.x,b)&&this.lessThanWithEpsilon(endpoint.y,e)){vb=new this.Vertex(b,this.equalWithEpsilon(k.x,b)?k.y:e)}else if(this.equalWithEpsilon(endpoint.y,e)&&this.lessThanWithEpsilon(endpoint.x,c)){vb=new this.Vertex(this.equalWithEpsilon(k.y,e)?k.x:c,e)}else if(this.equalWithEpsilon(endpoint.x,c)&&this.greaterThanWithEpsilon(endpoint.y,d)){vb=new this.Vertex(c,this.equalWithEpsilon(k.x,c)?k.y:d)}else if(this.equalWithEpsilon(endpoint.y,d)&&this.greaterThanWithEpsilon(endpoint.x,b)){vb=new this.Vertex(this.equalWithEpsilon(k.y,d)?k.x:b,d)}j=this.createBorderEdge(g.site,l,vb);i.splice(h+1,0,new this.Halfedge(g.site,j));nHalfedges=i.length}h++}}};Voronoi.prototype.addSites=function(a){var b=a.length;var v;for(var c=0;c<b;c++){v=a[c];this.sites.push(new this.Site(v.x,v.y))}};Voronoi.prototype.setSites=function(a){this.sites=[];this.addSites(a)};Voronoi.prototype.getSites=function(){return this.sites};Voronoi.prototype.compute=function(a){var b=new Date();this.siteEvents=[];this.circEvents=[];var c=this.sites.length;var d;for(var e=c-1;e>=0;e--){d=this.sites[e];if(!d.id){this.sites.splice(e,1)}else{this.queuePushSite({type:this.SITE_EVENT,x:d.x,y:d.y,site:d})}}this.arcs=[];this.edges=[];this.cells=new this.Cells();var f=this.queuePop();while(f){if(f.type===this.SITE_EVENT){this.cells.addCell(new this.Cell(f.site));this.addArc(f.site)}else if(f.type===this.CIRCLE_EVENT){this.removeArc(f)}else{this.queueSanitize()}f=this.queuePop()}this.closeCells(a);var g=new Date();var h={sites:this.sites,cells:this.cells,edges:this.edges,execTime:g.getTime()-b.getTime()};this.arcs=[];this.edges=[];this.cells=new this.Cells();return h};

module.exports = function () {
  return new Voronoi()
}
