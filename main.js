var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();
var naturalSatellites = [];
var angleStep = 2 * Math.PI;
var SPR = 8;
var gui = new dat.GUI();

var controls = new function()
{
    this.stars = null;
    this.addStars = true;
    this.revolutionSpeed = 1;
    this.rotationSpeed = 1;
    this.earthRadius = 2;
    this.sunScale = 20;
    this.AU = 150;
    this.SPR = 8;
    this.root = null;
    this.redraw = function() {
        scene.remove(this.root);
        if(this.stars != null)
            scene.remove(this.stars);
        this.root = _addPlanetarySystem(this.root);
        scene.add(this.root);
        if(this.addStars)
        {
            this.stars = _makeStars();
            scene.add(this.stars);
        }
    },
    this.scale = function() {
        this.AU = 700;
        this.sunScale = 109;
        this.revolutionSpeed = 0;
        this.rotationSpeed = 0;
        this.redraw();
        camera.position.set(-1367, -1670, 8709)
    },
    this.unscale = function() {
        this.AU = 150;
        this.sunScale = 20;
        this.revolutionSpeed = 0;
        this.rotationSpeed = 0;
        this.redraw();
        camera.position.set(-54, -66, 344);  
    }
};

//try { 
init();
createScene();
addToDOM();
animate();
/** 
} catch(e) { 
    var errorMsg = "Error: " + e; 
    document.getElementById("msg").innerHTML = errorMsg; 
} 
**/

function init() {
    var canvasWidth = window.innerWidth;
    var canvasHeight = window.innerHeight;
    var canvasRatio = canvasWidth / canvasHeight;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0x0, 1.0);

    camera = new THREE.PerspectiveCamera(40, canvasWidth / canvasHeight, 1, 90000);   
    camera.position.set(-54, -66, 344);  
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.minDistance = 1;
    cameraControls.maxDistance = 9000;
}

function createScene() {
    controls.redraw();
    light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(0, 0, 10);
    var ambientLight = new THREE.AmbientLight(0x222222);    
    gui.add(controls, 'rotationSpeed', 0, 100).step(0.1).name('rotation speed');
    gui.add(controls, 'revolutionSpeed', 0, 10).step(0.1).name('revolution speed');
    gui.add(controls, 'addStars').name(' Add Stars');
    gui.add(controls, 'redraw').name('Redraw');
    gui.add(controls, 'scale').name('Scale');
    gui.add(controls, 'unscale').name('Unscale');
    scene.add(light);
    scene.add(ambientLight);
}

function addToDOM() {
    var container = document.getElementById('container');
    var canvas = container.getElementsByTagName('canvas');
    if (canvas.length > 0) {
        container.removeChild(canvas[0]);
    }
    container.appendChild(renderer.domElement);
}

function animate() {
    window.requestAnimationFrame(animate);
    render();
}

function render() {
    var delta = clock.getDelta();
    for (var i = 0; i < naturalSatellites.length; i++) {
        var group = naturalSatellites[i].group;
        var revolution = naturalSatellites[i].revolution;
        var rotation = naturalSatellites[i].rotation;
        var curAngle = group.rotation.z + revolution * controls.revolutionSpeed * delta;
        if (curAngle >= angleStep)
            curAngle -= angleStep
        group.rotation.z = curAngle;
        naturalSatellites[i].inner.rotateZ(((Math.PI / 180)  * rotation) * controls.rotationSpeed);
    }
    
    cameraControls.update(delta);
    renderer.render(scene, camera);
}

/** 
 * Adds objects in the planetary system, returning the root containing it. 
 * @returns {THREE.Object3D} root - the root containg all objects. 
 */
function _addPlanetarySystem(root) {
    root = new THREE.Object3D();
    var solarSystem = {
        sun: null,
        earth: null,
        moon: null,
        mercury: null,
        venus: null,
        mars: null,
        jupiter: null,
        saturn: null,
        earthObj: null,
        moonObj: null,
        mercuryObj: null,
        venusObj: null,
        marsObj: null,
        jupiterObj: null,
        saturnObj: null
    };
    _createSolarSystemMeshes(solarSystem);
    _createSolarSystemMoons(solarSystem);    
    root.add(solarSystem.sun);
    naturalSatellites.push(solarSystem.mercuryObj);
    naturalSatellites.push(solarSystem.venusObj);
    naturalSatellites.push(solarSystem.earthObj);
    naturalSatellites.push(solarSystem.moonObj);
    naturalSatellites.push(solarSystem.marsObj);
    naturalSatellites.push(solarSystem.jupiterObj);
    naturalSatellites.push(solarSystem.saturnObj);
    return root;
}

 /** 
 * Creates the meshes for each planet in the solar system. 
 * @param {Object} solarSystem - the solar system containg all objects. 
 */
function _createSolarSystemMeshes(solarSystem) {
    var earthRadius = controls.earthRadius;
    solarSystem.sun = _createSolarSystemMesh("sunmap", null, controls.sunScale * earthRadius);
    solarSystem.sun.rotateX(206);
    solarSystem.earth = _createSolarSystemMesh("earthmap", "earthbump", earthRadius);
    solarSystem.earth.rotation.x = Math.PI / 2;
    solarSystem.moon = _createSolarSystemMesh("moonmap", "moonbump", (earthRadius * 0.27));
    solarSystem.mercury = _createSolarSystemMesh("mercurymap", "mercurybump", (earthRadius * 0.4));
    solarSystem.venus = _createSolarSystemMesh("venusmap", "venusbump", (earthRadius * 0.9));
    solarSystem.mars = _createSolarSystemMesh("marsmap", "marsbump", (earthRadius * 0.5));
    solarSystem.jupiter = _createSolarSystemMesh("jupitermap", null, (earthRadius * 11.2));
    solarSystem.jupiter.rotation.x = Math.PI / 2;
    solarSystem.saturn = _createSolarSystemMesh("saturnmap", null, (earthRadius * 9.4));
    solarSystem.saturn.rotation.x = Math.PI / 2;
    solarSystem.saturn = _addRings(solarSystem.saturn);
}

/** 
 * @param {string} texture the name of the .jpg image to apply the texture. Excludes the file extension. Ex: earthmap.
 * @param {string} bumpMap the name of the .jpg image to apply the bump. Excludes the file extension. Ex: earthbump.
 * @param {number} radius the radius 
 * @param {number} widthSegments the width segements 
 * @param {number} heightSegments the height segments 
 * @returns {THREE.Mesh} a mesh containg the solar system object.
 */
function _createSolarSystemMesh(texture, bumpMap, radius, widthSegments, heightSegments, mapURL, bumpMapURL) {
    mapURL = mapURL !== undefined ? mapURL : "images/" + texture + ".jpg";
    bumpMapURL = bumpMapURL !== undefined ? bumpMapURL : "images/" + bumpMap + ".jpg";
    widthSegments = widthSegments !== undefined ? widthSegments : 20;
    heightSegments = heightSegments !== undefined ? heightSegments : 20;
    var material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(mapURL),
        bumpMap: bumpMap == null ? null : new THREE.TextureLoader().load(bumpMapURL),
        bumpScale: bumpMap == null ? null : 0.05
    });
    var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

/** 
 * Creates the moons for each planet in the solar system. 
 * @param {Object} solarSystem - the solar system containg all objects. 
 */
function _createSolarSystemMoons(solarSystem) {
    // Revolutions, rotations and Astronomical Unit distances is respective to earth.
    var AU = controls.AU;
    solarSystem.earthObj = createMoon(solarSystem.earth, AU, SPR, 1);
    solarSystem.mercuryObj = createMoon(solarSystem.mercury, AU * 0.4, SPR * 0.2, 0.005684);
    solarSystem.venusObj = createMoon(solarSystem.venus, AU * 0.7, SPR * 0.6, -0.008565);  
    solarSystem.marsObj = createMoon(solarSystem.mars, AU * 1.52, SPR * 1.9, 1.1);
    solarSystem.jupiterObj = createMoon(solarSystem.jupiter, AU * 5.2, SPR * 11.9, 2.67);
    solarSystem.saturnObj = createMoon(solarSystem.saturn, AU * 9.6, SPR * 29.5, 2.4);
    solarSystem.moonObj = createMoon(solarSystem.moon, AU * 0.014288, 2, 0.033886);
    solarSystem.sun.add(solarSystem.mercuryObj.group);
    solarSystem.sun.add(solarSystem.venusObj.group);
    solarSystem.sun.add(solarSystem.earthObj.group);
    solarSystem.sun.add(solarSystem.marsObj.group);
    solarSystem.sun.add(solarSystem.jupiterObj.group);
    solarSystem.sun.add(solarSystem.saturnObj.group);
    solarSystem.earth.add(solarSystem.moonObj.group);
}

/** 
 * translates moonObject by distance units from a center point and that 
 * rotates that object at a rate given by secondsPerRevolution and secondsPerRotation. 
 * @param {*} moonObject  
 * @param {*} distance  
 * @param {*} secondsPerRevolution 
 * @param {*} secondsPerRotation 
 * @returns an Object containing the information the moon.
 */
function createMoon(moonObject, distance, secondsPerRevolution, secondsPerRotation) {
    var outer = new THREE.Object3D();
    var inner = new THREE.Object3D();
    inner.translateX(distance);
    outer.add(inner);
    inner.add(moonObject);
    var moon = {
        group: outer,
        inner: inner,
        revolution: (angleStep / secondsPerRevolution),
        rotation: secondsPerRotation
    }
    return moon;
}

/**
 * Adds rings to the planet saturn.
 * @param {Object3D} saturn - adds rings to the planet saturn.
 * @returns the planet with the rings.
 */
function _addRings(saturn, mapURL)
{
    mapURL = mapURL !== undefined ? mapURL : "images/saturnrings.png";
    var radius = saturn.radius;
    var geometry = new THREE.XRingGeometry(1.2 * radius, 2 * radius, 2 * 32, 5, 0, Math.PI * 2);
    var material = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture(mapURL),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
    });
    var rings = new THREE.Mesh(geometry, material);
    saturn.add(rings);
    return saturn;
}

/**
 * Adds stars in the backround.
 * @returns a THREE.Points containing the stars.
 */
function _makeStars(mapURL)
{
    mapURL = mapURL !== undefined ? mapURL : "images/starmap.jpg";
    var geometry = new THREE.Geometry();
    var material = new THREE.PointsMaterial({
        color: 'white',
        size: 1,
        map: new THREE.TextureLoader().load(mapURL),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    var particleCount = 100000;    
    var particleDistance = 9000;
    for( var i = 0; i < particleCount; i++){
        var x = (Math.random() - 0.5) * particleDistance;
        var y = (Math.random() - 0.5) * particleDistance;
        var z = (Math.random() - 0.5) * particleDistance;
        var particle = new THREE.Vector3(x,y,z);
        geometry.vertices.push(particle);
    }
    var stars = new THREE.Points(geometry, material);
    return stars;
}
