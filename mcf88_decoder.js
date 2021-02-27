function decodeUplink(input) {

    return DecodeMCF88Payload(input);

    function DecodeMCF88Payload(payload) {
        var data = {};
        var warnings = [];
        var raw_payload = toHexString(payload.bytes);
        data.port = payload.fPort;
        data.raw_payload = raw_payload;
        warnings.push("payload in hex: " + raw_payload);
        var id;
        id = raw_payload.substring(0, 2);
        data.uplinkId = id.toUpperCase();
        var content;
        if (id.toUpperCase() === "09") {
            warnings.push("decode metering uplink message");
            content = parseMetering(raw_payload);
            data = content;
        }
        else if (id.toUpperCase() === "0A") {
            warnings.push("decode IO uplink message");
            content = parseIO(raw_payload);
            data = content;
        }
        else if (id.toUpperCase() === "01") {
            warnings.push("decode TimeSync message");
            content = parseTimeSync(raw_payload);
            data = content;
        }
        else {
            //do nothing
        }
        return {
            data: data,
            warnings: warnings

        };
    }



    function parseIO(payload) {
        var date = {
            variable: 'date',
            value: parseDate(payload.substring(2, 10))
        };

        var firstByte = [];
        var secondByte = [];
        var thirdByte = [];
        var fourthByte = [];

        var k = 0;
        for (var i = 0; i < 3; i++) {
            firstByte[i] = parseInt(payload.substring(k + 10, k + 10 + 2), 16);
            secondByte[i] = parseInt(payload.substring(k + 10 + 2, k + 10 + 4), 16);
            thirdByte[i] = parseInt(payload.substring(k + 10 + 4, k + 10 + 6), 16);
            fourthByte[i] = parseInt(payload.substring(k + 10 + 6, k + 10 + 8), 16);

            k = k + 8;
        }

        var inputStatus8_1 = {
            variable: 'inputStatus8_1',
            value: firstByte[0].toString(2)
        };
        var inputStatus9_16 = {
            variable: 'inputStatus9_16',
            value: secondByte[0].toString(2)
        };
        var inputStatus17_24 = {
            variable: 'inputStatus17_24',
            value: thirdByte[0].toString(2)
        };
        var inputStatus25_32 = {
            variable: 'inputStatus25_32',
            value: fourthByte[0].toString(2)
        };

        var outputStatus8_1 = {
            variable: 'outputStatus8_1',
            value: firstByte[1].toString(2)
        };
        var outputStatus9_16 = {
            variable: 'outputStatus9_16',
            value: secondByte[1].toString(2)
        };
        var outputStatus17_24 = {
            variable: 'outputStatus17_24',
            value: thirdByte[1].toString(2)
        };
        var outputStatus25_32 = {
            variable: 'outputStatus25_32',
            value: fourthByte[1].toString(2)
        };

        var inputTrigger8_1 = {
            variable: 'inputTrigger8_1',
            value: firstByte[2].toString(2)
        };
        var inputTrigger9_16 = {
            variable: 'inputTrigger9_16',
            value: secondByte[2].toString(2)
        };
        var inputTrigger17_24 = {
            variable: 'inputTrigger17_24',
            value: thirdByte[2].toString(2)
        };
        var inputTrigger25_32 = {
            variable: 'inputTrigger25_32',
            value: fourthByte[2].toString(2)
        };

        return [
            date,
            inputStatus8_1,
            inputStatus9_16,
            inputStatus17_24,
            inputStatus25_32,
            outputStatus8_1,
            outputStatus9_16,
            outputStatus17_24,
            outputStatus25_32,
            inputTrigger8_1,
            inputTrigger9_16,
            inputTrigger17_24,
            inputTrigger25_32
        ];

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

    function parseTimeSync(payload) {
        var syncID = { variable: 'syncID', value: payload.substring(2, 10) };
        var syncVersion = { variable: 'syncVersion', value: payload.substring(10, 12) + "." + payload.substring(12, 14) + "." + payload.substring(14, 16) };
        var applicationType = { variable: 'applicationType', value: payload.substring(16, 20) };
        var rfu = { variable: 'rfu', value: payload.substring(20) };

        return [
            syncID,
            syncVersion,
            applicationType,
            rfu
        ];


    }


    function parseMetering(payload) {
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

            activation = {
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

    function hexStringToByteArray(s) {
        for (var bytes = [], c = 0; c < s.length; c += 2)
            bytes.push(parseInt(s.substr(c, 2), 16));
        return bytes;
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

}
