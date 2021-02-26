function decodeUplink(input) {

  return DecodeMCF88Payload(input);

  function DecodeMCF88Payload(payload) {
    var data = {};
    var warnings = [];

    var raw_payload = toHexString(payload.bytes);
    data.port = payload.fPort;
    data.raw_payload = raw_payload;
    var count = raw_payload.length;
    warnings.push("lenght:" + count);
    warnings.push(raw_payload);
    //data.uplinkid= payload.bytes[0];
    var id;
    id = raw_payload.substring(0, 2);
    data.uplinkId = id;

    if (id === "09") {
      var content;
      content = parseMetering(raw_payload);
      data = content;
      //var bin2 = Number(parseInt(reverseBytes(time), 16)).toString(2).padStart(32, '0');
      //warnings.push("bin2: " + bin2);
    }

    //data = content;
    return {
      data: data,
      warnings: warnings

    };

    function parseMetering(payload) {
      warnings.push("parse metering");
      warnings.push("parse date");
      var time = payload.substring(2, 10);
      warnings.push("time: " + time);
      //time = parseDate(payload.substring(2, 10));

      //var serie = time;
      var date = { variable: 'date', value: parseDate(payload.substring(2, 10)) };
      var activeEnergy = { variable: 'activeEnergy', value: parseSignedInt(payload.substring(10, 18)), unit: 'Wh' };
      var reactiveEnergy = { variable: 'reactiveEnergy', value: parseSignedInt(payload.substring(18, 26)), unit: 'VARh' };
      var apparentEnergy = { variable: 'apparentEnergy', value: parseSignedInt(payload.substring(26, 34)), unit: 'VAh' };

      if (payload.length <= 42) {
        var activation = {
          variable: 'activation',
          value: parseUnsignedInt(payload.substring(34, 42)),
          unit: 's'
        };


        return [date, activeEnergy, reactiveEnergy, apparentEnergy, activation];
      }
      else {
        var activePower = {
          variable: 'activePower',
          value: parseSignedShort(payload.substring(34, 38)),
          unit: 'W'
        };
        var reactivePower = {
          variable: 'reactivePower',
          value: parseSignedShort(payload.substring(38, 42)),
          unit: 'VAR'
        };
        var apparentPower = {
          variable: 'apparentPower',
          value: parseSignedShort(payload.substring(42, 46)),
          unit: 'VA'
        };
        var voltage = {
          variable: 'voltage',
          value: parseUnsignedShort(payload.substring(46, 50)),
          unit: 'dV RMS'
        };
        var current = {
          variable: 'current',
          value: parseUnsignedShort(payload.substring(50, 54)),
          unit: 'mA RMS'
        };
        var period = {
          variable: 'period',
          value: parseUnsignedShort(payload.substring(54, 58)),
          unit: 's'
        };

        var activation = {
          variable: 'activation',
          value: parseUnsignedInt(payload.substring(58, 66)),
          unit: 's'
        };

        return [
          date,
          activeEnergy,
          reactiveEnergy,
          apparentEnergy,
          activePower,
          reactivePower,
          apparentPower,
          voltage,
          current,
          period,
          activation
        ];
      }
    }



    function parseDate(payload) {
      var date = new Date();
      var binary = Number(parseInt(reverseBytes(payload), 16)).toString(2).padStart(32, '0');
      //warnings.push("time in binary: " + binary);
      var year = parseInt(binary.substring(0, 7), 2) + 2000;
      var month = parseInt(binary.substring(7, 11), 2) - 1;
      var day = parseInt(binary.substring(11, 16), 2);
      var hour = parseInt(binary.substring(16, 21), 2);
      var minute = parseInt(binary.substring(21, 27), 2);
      var second = parseInt(binary.substring(27, 32), 2) * 2;

      date = new Date(year, month, day, hour, minute, second, 0).toISOString();
      return date;
    }

    function parseSignedInt(bytes) {
      bytes = reverseBytes(bytes);
      var rno = hexStringToByteArray(bytes);
      var n = 0;
      if (rno.length === 4) {
        n = (rno[0] << 24) & 0xff000000 |
          (rno[1] << 16) & 0x00ff0000 |
          (rno[2] << 8) & 0x0000ff00 |
          (rno[3] << 0) & 0x000000ff;
      }
      return n;
    }

    function parseUnsignedInt(bytes) {
      bytes = reverseBytes(bytes);
      var rno = hexStringToByteArray(bytes);
      var n;
      if (rno.length === 4) {
        n = (rno[0] << 24) & 0x00000000ff000000 |
          (rno[1] << 16) & 0x0000000000ff0000 |
          (rno[2] << 8) & 0x000000000000ff00 |
          (rno[3] << 0) & 0x00000000000000ff;
      }
      return n;
    }

    function parseSignedShort(bytes) {
      bytes = reverseBytes(bytes);
      var rno = hexStringToByteArray(bytes);
      var n = 0;
      if (rno.length === 2) {
        n = ((rno[0] << 8) & 0x0000ff00 | (rno[1] << 0) & 0x000000ff);
      }
      return n;
    }

    function parseUnsignedShort(bytes) {
      substring = reverseBytes(bytes);
      var rno = hexStringToByteArray(bytes);
      var n = 0;
      if (rno.length === 2) {
          n = (rno[0] << 8) & 0x0000ff00 | (rno[1] << 0) & 0x000000ff;
      }
      return n;
  }



    function toHexString(byteArray) {
      return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
      }).join('')
    }

    function hexStringToByteArray(s) {
      for (var bytes = [], c = 0; c < s.length; c += 2)
        bytes.push(parseInt(s.substr(c, 2), 16));
      return bytes;
    }

    function reverseBytes(bytes) {
      var reversed = bytes;
      if (bytes.length % 2 === 0) {
        reversed = "";
        for (var starting = 0; starting + 2 <= bytes.length; starting += 2) {
          reversed = bytes.substring(starting, starting + 2) + reversed;
        }
      }
      return reversed;
    }

  }
}
