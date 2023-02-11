// object1 represents the object that is moving (the current player)
// object2 represents the object that is stationary (the collision block)
function collision({ object1, object2 }) {
  return (
    // if the bottom of the player is greater than or equal to the top of the collision block
    object1.position.y + object1.height >= object2.position.y &&
    // and if the top of the player is less than or equal to the bottom of the collision block
    object1.position.y <= object2.position.y + object2.height &&
    // and if the left of the player is greater than or equal to the right of the collision block
    object1.position.x <= object2.position.x + object2.width &&
    // and if the right of the player is less than or equal to the left of the collision block
    object1.position.x + object1.width >= object2.position.x
  );
  // return true if all of the above conditions are met
}

// only the second statement is changed for platform collisions which is stating that the bottom of the player is less than or equal to the bottom of the collision block
// meaning the bottom of the player needs to be inside the collision block in order to collide
function platformCollision({ object1, object2 }) {
  return (
    object1.position.y + object1.height >= object2.position.y &&
    // if the bottom of the player is less than or equal to the bottom of the collision block
    object1.position.y + object1.height <= object2.position.y + object2.height &&
    object1.position.x <= object2.position.x + object2.width &&
    object1.position.x + object1.width >= object2.position.x
  );
}
