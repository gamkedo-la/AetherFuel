var playerPic = document.createElement("img");
var darkTravelerPic = document.createElement("img");
var lightRiderPic = document.createElement("img");
var elDoradoPic = document.createElement("img");
var playerPicLarge = document.createElement("img");
var darkTravelerPicLarge = document.createElement("img");
var lightRiderPicLarge = document.createElement("img");
var tireTrackPic = document.createElement("img");
var neonLinePic = document.createElement("img");
var waypointPic = document.createElement("img");
var bombCraterPic = document.createElement("img");
var stunnedLightriderSpriteSheet = document.createElement("img");
var stunnedDarktravelerSpriteSheet = document.createElement("img");
var stunnedOpponentSpriteSheet = document.createElement("img");
var cracksPic = document.createElement("img");
var gravelPic = document.createElement("img");
var rocksPic = document.createElement("img");
var rubblePic = document.createElement("img");
var ebombPic = document.createElement("img");
var streetlightPic = document.createElement("img");
var gravitonShieldSheet = document.createElement("img");
var levelOnePic = document.createElement("img");
var levelTwoPic = document.createElement("img");
var levelThreePic = document.createElement("img");
var spaceBackGroundMenu = document.createElement("img");
var logoPic = document.createElement("img");
var uiPic = document.createElement("img");

var trackPix = new Array();
var roadPix = new Array();

var picsToLoad = 0;

function countLoadedImagesAndLaunchIfReady()
{
    picsToLoad--;
    if (picsToLoad == 0)
    {
        imageLoadingDoneSoStartGame();
    }
}

function beginLoadingImage(imgVar, filename)
{
    imgVar.onload = countLoadedImagesAndLaunchIfReady;
    imgVar.src = "Images/" + filename;
}

function loadImageForTrackCode(trackCode, filename)
{
    trackPix[trackCode] = document.createElement("img");
    beginLoadingImage(trackPix[trackCode], filename);
}

function loadImageForRoadCode(levelCode, filename)
{
    roadPix[levelCode] = document.createElement("img");
    beginLoadingImage(roadPix[levelCode], filename);
}

function loadImages()
{
    var imageList = [
        {varName: playerPic, theFile: "el-dorado.png"},
		{varName: darkTravelerPic, theFile: "darktraveler.png"},
		{varName: lightRiderPic, theFile: "lightrider.png"},
        {varName: elDoradoPic, theFile: "el-dorado.png"},
		{varName: lightRiderPicLarge, theFile: "lightrider_large.png"},
		{varName: darkTravelerPicLarge, theFile: "darktraveler_large.png"},
		{varName: playerPicLarge, theFile: "el-dorado_large.png"},
        {varName: stunnedLightriderSpriteSheet, theFile: "stunnedOpponent/lightrider_stunned.png"},
        {varName: stunnedDarktravelerSpriteSheet, theFile: "stunnedOpponent/darktraveler_stunned.png"},
        {varName: stunnedOpponentSpriteSheet, theFile: "stunnedOpponent/el-dorado_stunned.png"},
        {varName: tireTrackPic, theFile: "tireTracks.png"},
        {varName: neonLinePic, theFile: "neonLine.png"},
        {varName: waypointPic, theFile: "Waypoint.png"},
        {varName: bombCraterPic, theFile: "bombCrater.png"},
        {varName: cracksPic, theFile: "decalCracks.png"},
        {varName: gravelPic, theFile: "decalGravel.png"},
        {varName: rocksPic, theFile: "decalRocks.png"},
        {varName: rubblePic, theFile: "decalRubble.png"},
        {varName: ebombPic, theFile: "ebomb.png"},
		{varName: streetlightPic, theFile: "streetlight.png"},
		{varName: gravitonShieldSheet, theFile: "gravitonShieldSheet.png"},
		{varName: levelOnePic, theFile: "level1.png"},
		{varName: levelTwoPic, theFile: "level2.png"},
		{varName: levelThreePic, theFile: "level3.png"},
		{varName: spaceBackGroundMenu, theFile: "space_background_menu.png"},
        {varName: logoPic, theFile: "logo.png"},
        {varName: uiPic, theFile: "UI_Back.png"},
        {trackType: TRACK_ROAD, level: LEVEL_SAND, theFile: "sand.png"},
        {trackType: TRACK_ROAD, level: LEVEL_MUD, theFile: "mud.png"},
        {trackType: TRACK_ROAD, level: LEVEL_ICE, theFile: "ice2.png"},
        {trackType: TRACK_WALL, theFile: "TrackWall2.png"},
        {trackType: TRACK_TREE, theFile: "palm.png"},
        {trackType: TRACK_FLAG, theFile: "Flag.png"},
        {trackType: TRACK_GOAL, theFile: "Goal.png"},
        {trackType: TRACK_SAND_WITH_E_BOMB, theFile: "sandWithE_Bomb.png"},
    ]

    picsToLoad = imageList.length;

    for (var i = 0; i < picsToLoad; i++)
    {
        if (imageList[i].varName != undefined)
        {
            beginLoadingImage(imageList[i].varName, imageList[i].theFile);
        }
        else if (imageList[i].level != undefined)
        {
            loadImageForRoadCode(imageList[i].level, imageList[i].theFile);
        }
        else
        {
            loadImageForTrackCode(imageList[i].trackType, imageList[i].theFile);
        }
    }
}
