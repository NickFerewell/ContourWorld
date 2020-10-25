var diagram;
var bbox;
var castleNum = 42; //30
var looseWeight = 0; //5
var tileSize = 13; //40, 20, 10
var zoom = 11.8;
let mapOffsetX = 0;
let mapOffsetY = 0;
let cameraRect;
let slicesOnScreen = [];
const maxZoom = 120; //90
const minZoom = 11;
let noiseScale = 0.05; //0.15 или 0.03
var heightMap = [];
var slices = [];
let isRenderNoise = false;
var SEED;

function setup(){
    createCanvas(windowWidth, windowHeight);
    background(204);
    cameraRect = {x: 0, y: 0, w: windowWidth, h: windowHeight};

    SEED = random() * 255;
    noiseSeed(SEED); 
    

    computeNoise();
    computeContours();
    updateSlicesOnScreen();
    // computeDiagram();
    render();

    // console.log(isPointInRect(rectangle, pppoint));
    // console.log(checkLineIntersection(0,0,1,1,0,1,1,0));
    let rect = [
        {x: 1, y: 1},
        {x: 2, y: 2},
        {x: 2, y: 1},
        {x: 3, y: 2},
        {x: 2, y: 3}
    ];
    console.log(inside({x: 2, y: 2.5}, rect));
}

function draw(){
    render();
}

function render(){
    // diagram.edges.forEach(e => {
    //     line(e.va.x, e.va.y, e.vb.x, e.vb.y);
    // });
    // console.log(diagram);
    // console.log(heightMap);
    renderContours();
    if(isRenderNoise){
        renderNoise();
    }
    // renderDiagram();

    push();
    strokeWeight(10);
    stroke(255, 0, 0);
    noFill();
    // rect(cameraRect.x, cameraRect.y, cameraRect.w, cameraRect.h);
    pop();

    
    
   
    
    // diagram.cells.forEach(cell => {
    //     drawCastle(cell.site.x, cell.site.y);
    // });
}

function computeNoise(){
    {
        let i = 0;
        do{
            i++;
            let y = [];
            let j = 0;
            do {
                j++;
                y.push(noise(i * noiseScale, j * noiseScale));
            } while (j < height/tileSize);
            // for (let j = 0; j < height/tileSize; j++) {
            //     y.push(noise(i * noiseScale, j * noiseScale));
            // }
            heightMap.push(y);
        }while(i < width /tileSize);
    }
    for (let j = 0; j < heightMap[0].length; j++) {
        heightMap[0][j] = 0;
    }
    for (let i = 0; i < heightMap.length; i++) {
        heightMap[i][0] = 0;
    }
    for (let i = 0; i < heightMap[heightMap.length - 1].length; i++) {
        heightMap[heightMap.length - 1][i] = 0;
    }
    for (let i = 0; i < heightMap.length; i++) {
        heightMap[i][heightMap[i].length] = 0;
    }
}

function renderNoise(){
    // push();
    // colorMode(HSB);
    // strokeWeight(0);
    // for(let i = 0; i < width / tileSize; i++){
    //     for(let j = 0; j < height / tileSize; j++){
    //         fill(0, 0,noise(i / zoom, j / zoom) * 255, 50);
    //         rect(i * tileSize, j * tileSize, 20, 20);
    //     }
    // }
    // pop();
    push();
    colorMode(RGB);
    for(let i = 0; i < heightMap.length; i++){
        for(let j = 0; j < heightMap[i].length; j++) {
            fill(heightMap[i][j] * 255,heightMap[i][j] * 255, heightMap[i][j] * 255, 200);
            // console.log(heightMap[i][j]);
            rect(i * tileSize - cameraRect.x, j * tileSize - cameraRect.y, tileSize, tileSize);
        };
    };
    pop();
    // console.log("Render");
}

function computeContours(){
    // xs = range(0, heightMap.length, 1);
    // console.log(heightMap.length, heightMap[0].length);
    xs = range(0, heightMap.length - 0, tileSize);
    ys = range(0, heightMap[0].length - 0, tileSize); //tileSize - 13
    console.log(heightMap[1]);
    zs = [0, 0.1, 0.2, , 0.45, 0.5, 0.73, 0.75];
    // console.log(xs, ys);
    let c = new Conrec();
    c.contour(heightMap, 0, xs.length - 3, 0, ys.length - 0, xs, ys, zs.length, zs);
    // console.log(c.contourList());
    slices = c.contourList();
    // slices.forEach(slice => {
    //     slice.forEach(vertex => {
    //         if(vertex != slice.k || vertex != slice.level){
    //             Math.round(vertex.x);
    //             Math.round(vertex.y);
    //         }
    //     });
    // });
}

function renderContours(){
    // console.log(slicesOnScreen);
    background(204);
    push();
    strokeWeight(2);
    for (let i = slicesOnScreen.length - 1; i >= 0; i--) {
        const figure = slicesOnScreen[i];
        beginShape();
        switch (figure.level) {
            case 0.5:
                fill(93, 161, 48);
                break;

            case 0.45:
                fill(60, 170, 60);
                break;
    
            case 0.2:
                fill(41, 171, 135); //100, 200, 200; 31, 206, 201
                break;

            case 0.73: //горы (или такой цвет: 150, 75, 0)
                fill(162, 95, 42);
                break;

            case 0: //край мира, чтобы не было неправильных кусков
                fill(0, 57, 66);
                break;

            case 0.1:
                fill(0, 78, 100);
                break;

            case 0.75: //снег на горах
                fill(240, 240, 240);
                break;

            default:
                fill(10, 255, 30);
                break;
        }
        for (let j = figure.length - 1; j >= 0; j--) {
            const path = figure[j];
            vertex((path.x - cameraRect.x) * (width / cameraRect.w), (path.y - cameraRect.y) * (height / cameraRect.h))
        }
        endShape(CLOSE);
    }
    pop();
}

function updateSlicesOnScreen(){
    slicesOnScreen = [];
    slices.forEach(slice => {
        let isOnScreen = false;
        for (let i = 0; i < slice.length; i++) {
            let vertex = slice[i];
            if(isPointInRect(cameraRect, vertex)){
                slicesOnScreen.push(slice);
                isOnScreen = true;
                break;
            }
        }
        // let tSlice = Object.assign({}, slice);
        // delete tSlice.k;
        // delete tSlice.level;
        // let mSlice = Object.values(tSlice).map(v => Object.values(v))
        // console.log(tSlice);
        // console.log(slice);

        if(isOnScreen == false){
            // console.log("gjhf");
            if(inside({x: 100, y: 100}, slice)){
                slicesOnScreen.push(slice);
                console.log("1");
            } else if(inside({x: cameraRect.x + cameraRect.w, y: cameraRect.y}, slice)){
                slicesOnScreen.push(slice);
                console.log("2");
            } else if(inside({x: cameraRect.x + cameraRect.w, y: cameraRect.y + cameraRect.h}, slice)){
                slicesOnScreen.push(slice);
                console.log("3");
            } else if(inside({x: cameraRect.x, y: cameraRect.y + cameraRect.h}, slice)){
                slicesOnScreen.push(slice);
                console.log("4");
            } 
        }
    });
}

function computeDiagram(){
    var voronoi = new Voronoi();
    bbox = {xl: 0, xr: width, yt: 0, yb: height}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom
    var sites = [];
    // for (let i = 0; i < castleNum; i++) {
    //     sites.push(createVector(random() * width, random() * height));
    // }
    sites = getCities();
    diagram = voronoi.compute(sites, bbox);
}

// function prettifyDiagram(){
//     let tSites = [];
//     diagram.cells.forEach(cell => {
//         tSites.push([cell.site.x, cell.site.y]);
//     });

//     for(let i = tSites.length - 1; i >= 0 ; i--){
//         let iterations = 0;
//         slices.forEach(figure => {
//             console.log(tSites);
//             console.log(tSites[i]);
//             console.log(i);
//             if(!(inside([tSites[i].x / tileSize, tSites[i].y / tileSize], figure) && figure.level == 0.5)){
//                 iterations++;
//             }
//         });
//         if(iterations == slices.length){
//             tSites.splice(i, 1);
//         }
//     };
//     diagram = voronoi.compute(tSites, bbox);
// }

function renderDiagram(){
    colorMode(RGB);
    stroke(255);
    strokeWeight(looseWeight);
    diagram.cells.forEach(cell => {
        fill(random() * 255, random() * 255, random() * 255, 70);
        beginShape();
        cell.halfedges.forEach( he => {
            vertex(he.getEndpoint().x, he.getEndpoint().y);
        });
        endShape(CLOSE);
    });
}

// function getCities(){
//     cities = [];
//     slices.forEach(figure => {
//         do {
//             city = [random() * width / tileSize, random() * height / tileSize];
//         } while (!isPointInRect(getBBox(figure), city));
//         cities.push(city);
//     });
//     return cities
// }

// function updateCamera(delta){
//     scaleRect(cameraRect, delta);
// }

function getCities(){
    cities = [];
    slices.forEach(slice => {
        if(slice.level = 0.5){
             
        }
    });
    return cities;
}


function getBBox(shape){
    let x = 0, y = 0, w = 0, h = 0;
    shape.forEach(point => {
        if(point.x < x){x = point.x};
        if(point.x > w){w = point.x};
        if(point.y < y){y = point.y};
        if(point.y > h){h = point.y};
    });
    return [x, y, w, h];
}

// function scaleMap(times){
//     heightMap.forEach(x => {
//         x.forEach(y => {
//             y * times
//         });
//     });
// }

function drawCastle(x, y){
    push();
    fill("red");
    stroke(31);
    strokeWeight(2);
    translate(createVector(x, y));
    beginShape();
    for(let i = 0; i < 5; i++){
        let angle = map(i, 0, 5, 0, TWO_PI) - HALF_PI; //если сделать + половина Пи, то будет по другому, эстетичнее
        let x = 7 * cos(angle);
        let y = 7 * sin(angle);
        vertex(x, y);
    }
    endShape(CLOSE);
    pop();
}

// function concuareCities(){
//     diagram.edges.forEach(edge => {
//         if(dist(createVector(edge.lSite.x, edge.lSite.y), createVector(edge.rSite.x, edge.rSite.y) <= 20)){
//             id = edge.lSite.voronoiId;
            
//         }
//     });
// }

function mouseWheel(event){
    // let oldZoom = zoom;
    // zoom += event.delta / 1000;
    // console.log(event.delta, zoom);
    // if(zoom > maxZoom){zoom = maxZoom}
    // if(zoom < minZoom){zoom = minZoom}
    // if(oldZoom != zoom){
        // renderNoise();
        // render();
    // }
    scaleRect(cameraRect, map(event.delta / 100, - 100, 100, 0, 200));
    updateSlicesOnScreen();
    return false;
}

function mouseDragged(){
    if(mouseIsPressed){
    // mapOffsetX += movedX;
    // mapOffsetY += movedY;
    cameraRect.x -= movedX / (width / cameraRect.w);
    cameraRect.y -= movedY / (height / cameraRect.h);
    // render();
    }
    // console.log(mapOffsetX);
    updateSlicesOnScreen();
}

function scaleRect(rect, dif){
    // if(dif > 0){
    //     dif = 1 / dif;
    // }
    // rect.w = (rect.w / 100) * dif;
    // rect.h = (rect.h / 100) * dif;
    // rect.x += rect.w / 2;
    // rect.y += rect.h / 2;
    let centerX = rect.x + (rect.w / 2);
    let centerY = rect.y + (rect.h / 2);
    rect.w = (rect.w / 100) * dif;
    rect.h = (rect.h / 100) * dif;
    rect.x = centerX - (rect.w / 2);
    rect.y = centerY - (rect.h / 2);
}

function range(from, to, dif){
    let x=[];
    let i = from;
    x.push(i);
    do{
        i += dif;
        x.push(i);
    }while(i <= to * dif);
    return x;
}

function keyPressed(){
    if (keyCode == 32) {
        isRenderNoise = !isRenderNoise;
        render();
        // console.log(isRenderNoise);
    }
}

function windowResized(){
    // resizeCanvas(windowWidth, windowHeight); надо заново всё пересчитывать
}

// function inside(point, vs) {
//     // ray-casting algorithm based on
//     // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
    
//     var x = point[0], y = point[1];
    
//     var inside = false;
//     for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
//         var xi = vs[i][0], yi = vs[i][1];
//         var xj = vs[j][0], yj = vs[j][1];
        
//         var intersect = ((yi > y) != (yj > y))
//             && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
//         if (intersect) inside = !inside;
//     }
    
//     return inside;
// };

function inside(point, poly){
    let result = false;
    // console.log(point, poly);
    let j = poly.length - 1;
    // console.log(j);
    for (let i = 0; i < poly.length; i++) {
        if ( (poly[i].y < point.y && poly[j].y >= point.y || poly[j].y < point.y && poly[i].y >= point.y) &&
            (poly[i].x + (point.y - poly[i].y) / (poly[j].y - poly[i].y) * (poly[j].x - poly[i].x) < point.x) )
            result = !result;
        j = i;
    }
    // return true;
    return result;
}

var rectangle = {
    x: 4,
    y: 4,
    w: 6,
    h: 3
}
var pppoint = {
    x: 5,
    y: 6
}

function isPointInRect(rect, point){
    answer = false;
    if(point.x <= rect.x + rect.w && point.x >= rect.x && point.y <= rect.y + rect.h && point.y >= rect.y){
        answer = !answer;
    }
    return answer;
}

function checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
        return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
/*
        // it is worth noting that this should be the same as:
        x = line2StartX + (b * (line2EndX - line2StartX));
        y = line2StartX + (b * (line2EndY - line2StartY));
        */
       // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
}




/* сиды с ошибками: 
    225.96459711595458 (груги цвета моря в море, исчезли после смены цвета)
    63.891081744363525 (груги цвета моря в море)
    115.264610765472 (груги цвета моря в море)

    для Пангеи: 212.28649255551102
    для крутой карты: 201.99317641105995 , 247.9727420551782 , 31 , 
    крутой материк с островами на уровне 0.5 и 0.4: 7.394503247685006
    много островов: 240.32995906856155
    мини-архипелаг на размере 0.03: 193.57156857683498
    красота(0.05): 154.55169173407148

    TODO:
    в краях сделать интерполяцию, аппроксиматизацию, а не просто приравнять нулю;
    для сглаживания глубокого моря его надо убрать путём повышения уровня моря или сдвинуть края фигуры к краю;

    layers, contours, slices
*/