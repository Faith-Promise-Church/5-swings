/* eslint-disable jsx-a11y/alt-text */
import fs from "fs";
import path from "path";
import * as React from "react";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { Language, SearchResultPerson } from "@/lib/types";
import { translate } from "@/lib/messages";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#F5F1EA",
    color: "#445557",
    fontSize: 12,
    paddingTop: 44,
    paddingBottom: 44,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 130,
    height: 48,
    objectFit: "contain",
  },
  heading: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 6,
  },
  meta: {
    color: "#6F878D",
    marginBottom: 4,
  },
  section: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    border: "1 solid #E4DFD6",
    borderRadius: 12,
    padding: 18,
  },
  swingRow: {
    marginBottom: 14,
  },
  swingTitle: {
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 600,
  },
  winsLabel: {
    marginTop: 6,
    marginBottom: 4,
    color: "#6F878D",
    fontSize: 11,
  },
  win: {
    marginLeft: 12,
    marginBottom: 3,
    fontSize: 11,
  },
});

function getLogoPath() {
  const logoPath = path.join(process.cwd(), "public", "fp-logo.png");
  return fs.existsSync(logoPath) ? logoPath : null;
}

export function ReportPdf({
  people,
  title,
  language,
}: {
  people: SearchResultPerson[];
  title: string;
  language: Language;
}) {
  const logoPath = getLogoPath();

  return (
    <Document title={title}>
      {people.map((person) => (
        <Page key={person.swingsId} size="LETTER" style={styles.page}>
          <View style={styles.logoWrap}>
            {logoPath ? (
              <Image src={logoPath} style={styles.logo} />
            ) : (
              <Text style={styles.heading}>Faith Promise</Text>
            )}
          </View>
          <Text style={styles.heading}>{`${person.firstName} ${person.lastName}`}</Text>
          <Text style={styles.meta}>
            {translate(language, "swingCard.campus")}: {person.campus}
          </Text>
          <Text style={styles.meta}>
            {translate(language, "swingCard.area")}: {person.area}
          </Text>
          <View style={styles.section}>
            {person.swings.map((swing, index) => (
              <View key={`${person.swingsId}-${index}`} style={styles.swingRow}>
                <Text style={styles.swingTitle}>{`${index + 1}. ${swing.category}`}</Text>
                {swing.wins.length ? (
                  <>
                    <Text style={styles.winsLabel}>
                      {translate(language, "swingCard.weeklyWins")}
                    </Text>
                    {swing.wins.map((win) => (
                      <Text key={win} style={styles.win}>
                        • {win}
                      </Text>
                    ))}
                  </>
                ) : null}
              </View>
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
}
