"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
var aws_amplify_1 = require("aws-amplify");
var data_1 = require("aws-amplify/data");
var runtime_1 = require("@aws-amplify/backend/function/runtime");
var post_confirmation_1 = require("$amplify/env/post-confirmation");
// ---- Configure Amplify Data client at module load (ESM supports top-level await)
var _a = await (0, runtime_1.getAmplifyDataClientConfig)(post_confirmation_1.env), resourceConfig = _a.resourceConfig, libraryOptions = _a.libraryOptions;
aws_amplify_1.Amplify.configure(resourceConfig, libraryOptions);
var client = (0, data_1.generateClient)();
// Small helpers to sanitize optional attributes
var s = function (v) { return (typeof v === 'string' ? v.trim() : ''); };
var toLower = function (v) { return (typeof v === 'string' ? v.trim().toLowerCase() : ''); };
var handler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var sub, email, givenName, familyName, phoneNumber, existing, result, error_1;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                sub = event.request.userAttributes.sub;
                email = toLower(event.request.userAttributes.email);
                givenName = s(event.request.userAttributes.given_name);
                familyName = s(event.request.userAttributes.family_name);
                phoneNumber = s(event.request.userAttributes.phone_number);
                console.log("Post-confirmation triggered for user: ".concat(sub));
                _c.label = 1;
            case 1:
                _c.trys.push([1, 7, , 11]);
                return [4 /*yield*/, client.models.UserProfile.get({ id: sub })];
            case 2:
                existing = _c.sent();
                if (!existing.data) return [3 /*break*/, 4];
                console.log("\u2139\uFE0F Profile exists for ".concat(sub, ". Updating basic attributes if changed."));
                return [4 /*yield*/, client.models.UserProfile.update({
                        id: sub,
                        userId: sub,
                        email: email || existing.data.email || '',
                        givenName: givenName || existing.data.givenName || '',
                        familyName: familyName || existing.data.familyName || '',
                        phoneNumber: phoneNumber || existing.data.phoneNumber || '',
                    })];
            case 3:
                _c.sent();
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, client.models.UserProfile.create({
                    id: sub, // PK
                    userId: sub, // owner field for ownerDefinedIn
                    email: email || '',
                    givenName: givenName,
                    familyName: familyName,
                    phoneNumber: phoneNumber,
                    // Defaults for optional fields you’ll fill later
                    companyName: '',
                    jobTitle: '',
                    addressLine1: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: '',
                    subscriptionType: 'free', // <-- match your schema’s casing
                    profileCompleted: false,
                })];
            case 5:
                result = _c.sent();
                if ((_a = result.data) === null || _a === void 0 ? void 0 : _a.id) {
                    console.log("\u2705 Created profile for: ".concat(sub));
                }
                else {
                    console.error('❌ Failed to create profile:', result.errors);
                }
                _c.label = 6;
            case 6: return [3 /*break*/, 11];
            case 7:
                error_1 = _c.sent();
                if (!((_b = error_1 === null || error_1 === void 0 ? void 0 : error_1.errors) === null || _b === void 0 ? void 0 : _b.some(function (e) { return String(e.message || '').includes('already exists'); }))) return [3 /*break*/, 9];
                console.warn('⚠️ Create collided (already exists). Falling back to update.');
                return [4 /*yield*/, client.models.UserProfile.update({
                        id: sub,
                        userId: sub,
                        email: email || '',
                        givenName: givenName,
                        familyName: familyName,
                        phoneNumber: phoneNumber,
                    })];
            case 8:
                _c.sent();
                return [3 /*break*/, 10];
            case 9:
                console.error('❌ Error in post-confirmation handler:', error_1);
                _c.label = 10;
            case 10: return [3 /*break*/, 11];
            case 11: return [2 /*return*/, event];
        }
    });
}); };
exports.handler = handler;
