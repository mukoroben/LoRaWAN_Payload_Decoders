function decodeUplink(input) {

    return DecodeMCF88Payload(input);
    function DecodeMCF88Payload(payload) {
        var data = {};
        var warnings = [];
        data.payload = payload.bytes;
        data.port = payload.fPort;
        data.uplinkid0 = payload.bytes[0];

        if (data.uplinkid0 == "9") {
          warnings.push("parse metering");
           var activeEnergy = parseSignedInt(data.payload.substring(10, 18));

        }

        return {
            data: data,
            warnings: warnings
        };

    }
}