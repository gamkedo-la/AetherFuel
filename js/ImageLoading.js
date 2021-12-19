var playerPic = document.createElement("img");
var darkTravelerPic = document.createElement("img");
var lightRiderPic = document.createElement("img");
var tireTrackPic = document.createElement("img");
var neonLinePic = document.createElement("img");
var waypointPic = document.createElement("img");
var bombCraterPic = document.createElement("img");
var stunnedOpponentSpriteSheet = document.createElement("img");
var cracksPic = document.createElement("img");
var gravelPic = document.createElement("img");
var rocksPic = document.createElement("img");
var rubblePic = document.createElement("img");

var trackPix = new Array();

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

function loadImages()
{
    var imageList = [
        {varName: playerPic, theFile: "spaceship_40x40.png"},
		{varName: darkTravelerPic, theFile: "spaceship_40x40-red.png"},
		{varName: lightRiderPic, theFile: "lightrider.png"},
        {varName: stunnedOpponentSpriteSheet, theFile: "stunnedOpponent/stunnedOpponentSheet.png"},
        {varName: tireTrackPic, theFile: "tireTracks.png"},
        {varName: neonLinePic, theFile: "neonLine.png"},
        {varName: waypointPic, theFile: "Waypoint.png"},
        {varName: bombCraterPic, theFile: "bombCrater.png"},
        {varName: cracksPic, theFile: "decalCracks.png"},
        {varName: gravelPic, theFile: "decalGravel.png"},
        {varName: rocksPic, theFile: "decalRocks.png"},
        {varName: rubblePic, theFile: "decalRubble.png"},
        {trackType: TRACK_ROAD, theFile: "sand.png"},
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
        else
        {
            loadImageForTrackCode(imageList[i].trackType, imageList[i].theFile);
        }
    }
}
