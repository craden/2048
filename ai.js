function AI() {
  this.cache_before_movement = {};
  this.cache_after_movement = {};
  this.best_operation = 0;
  this.grid = Array(16);
  this.node = 0;
  this.max_depth = 3;
}

AI.prototype.MoveLeft = function(s) {
  var k = 0;
  var base = 0;
  var score = 0;
  var result = new Array(16);
  for (var i = 4; i <= 16; i += 4) {
    while (k < i) {
      if (s[k] == 0) {
        ++k;
        continue;
      }        
      if (k + 1 < i && s[k] == s[k + 1]) {
        result[base++] = s[k] * 2;
        score += s[k] * 2;
        k += 2;
      } else {
        result[base++] = s[k++];
      }
    }
    while (base < i) {
      result[base++] = 0;
    }
  }
  return [result, score];
};
  
AI.prototype.Rotate = function(s) {
  return new Array(s[12], s[8], s[4], s[0],
                   s[13], s[9], s[5], s[1],
                   s[14], s[10], s[6], s[2],
                   s[15], s[11], s[7], s[3]);    
};

AI.prototype.Reflect = function(s) {
  return new Array(s[12], s[13], s[14], s[15],
                   s[8], s[9], s[10], s[11],
                   s[4], s[5], s[6], s[7],
                   s[0], s[1], s[2], s[3]);
};

AI.prototype.Find = function(dict, s) {
  if (dict[s]) return dict[s];
  s = this.Rotate(s);
  if (dict[s]) return dict[s];
  s = this.Rotate(s);
  if (dict[s]) return dict[s];
  s = this.Rotate(s);
  if (dict[s]) return dict[s];
  s = this.Reflect(s);
  if (dict[s]) return dict[s];
  s = this.Rotate(s);
  if (dict[s]) return dict[s];
  s = this.Rotate(s);
  if (dict[s]) return dict[s];
  s = this.Rotate(s);
  return dict[s];
};

AI.prototype.Estimate = function(s) {
  var diff = 0;
  var sum = 0;
  for (var i = 0; i < 16; ++i) {
    sum += s[i];
    if (i % 4 != 3 && s[i] != s[i + 1]) {
      diff += Math.abs(s[i] - s[i + 1]);
    }
    if (i < 12 && s[i] != s[i + 4]) {
      diff += Math.abs(s[i] - s[i + 4]);
    }
  }
  return (sum - diff / 2);
};

AI.prototype.Search = function(s, depth) {
  this.node++;
  if (depth >= this.max_depth) return this.Estimate(s);
  var result = this.Find(this.cache_before_movement, s);
  if (result) {
    this.cache_before_movement[s] = result;
    return result;
  }
  var best = -1;
  for (var i = 0; i < 4; ++i) {
    var results = this.MoveLeft(s);
    var t = results[0];
    var same = true;
    for (var j = 0; j < 16; ++j) {
      if (t[j] != s[j]) {
        same = false;
        break;
      }
    }
    if (!same) {
      var temp = this.Find(this.cache_after_movement, t);
      if (!temp) {
        temp = 0;
        var empty_slots = 0;
        for (var j = 0; j < 16; ++j) {
          if (t[j] == 0) {
            t[j] = 2;
            temp += this.Search(t, depth + 1) * 0.9;
            empty_slots += 0.9;
            t[j] = 4;
            temp += this.Search(t, depth + 1) * 0.1;
            empty_slots += 0.1;
            t[j] = 0;
          }
        }
        if (empty_slots != 0) {
          temp /= empty_slots;
        } else {
          temp = -10000000;
        }
        this.cache_after_movement[t] = temp;
      } else {
        this.cache_after_movement[t] = temp;
      }
      if (results[1] + temp > best) {
        best = results[1] + temp;
        if (depth == 0) {
          this.best_operation = i;
        }
      }    
    }
    if (i != 3) {
      s = this.Rotate(s);
    }
  }    
  this.cache_before_movement[s] = best;
  return best;
};

AI.prototype.SetTile = function(x, y, v) {
  this.grid[x + y * 4] = v;
};

AI.prototype.StartSearch = function() {
  this.cache_before_movement = {};
  this.cache_after_movement = {};
  if (this.node < 200) {
    this.max_depth = 6;
  } else if (this.node < 1000) {
    this.max_depth = 5;
  } else if (this.node < 4000) {
    this.max_depth = 4;
  } else {
    this.max_depth = 3;
  }
  this.node = 0;
  this.Search(this.grid, 0);
  console.log(this.node);
};
