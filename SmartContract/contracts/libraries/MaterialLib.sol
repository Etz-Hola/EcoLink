// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library MaterialLib {
    enum MaterialType {
        TransparentPlastic,
        LabeledPlastic,
        OrganicWaste,
        RecyclableWaste,
        HazardousWaste,
        Textile,
        FerrousMetal,
        NonFerrousMetal,
        MixedMetal
    }
    enum Quality { Clean, Dirty, Treated }
}